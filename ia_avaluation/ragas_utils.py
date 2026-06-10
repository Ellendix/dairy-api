import asyncio
import json
import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()


def obter_token() -> str:
    response = requests.post(
        f"{os.getenv('BASE_URL')}/auth/login",
        json={
            "email": os.getenv("EMAIL"),
            "password": os.getenv("PASSWORD"),
        },
        timeout=60,
    )

    print("LOGIN STATUS:", response.status_code)
    assert response.status_code == 200

    return response.json()["accessToken"]


def _normalizar_contextos(valor: Any) -> list[str]:
    if valor is None:
        return []

    if isinstance(valor, str):
        return [valor]

    if isinstance(valor, dict):
        for chave in ("content", "text", "message", "chunk", "answer", "response"):
            conteudo = valor.get(chave)
            if isinstance(conteudo, str) and conteudo.strip():
                return [conteudo]
        return [json.dumps(valor, ensure_ascii=False)]

    if isinstance(valor, list):
        itens: list[str] = []
        for item in valor:
            itens.extend(_normalizar_contextos(item))
        return [item for item in itens if item.strip()]

    return [str(valor)]


def extrair_resposta_e_contextos(response: requests.Response) -> tuple[str, list[str]]:
    resposta_texto = response.text
    contextos: list[str] = []

    try:
        payload = response.json()
    except ValueError:
        return resposta_texto, contextos

    if not isinstance(payload, dict):
        return resposta_texto, contextos

    resposta_texto = (
        payload.get("response")
        or payload.get("answer")
        or payload.get("message")
        or payload.get("text")
        or resposta_texto
    )

    for chave in (
        "retrieved_contexts",
        "contexts",
        "context",
        "sources",
        "source_documents",
    ):
        contextos = _normalizar_contextos(payload.get(chave))
        if contextos:
            break

    return resposta_texto, contextos


def chamar_ia(pergunta: str) -> tuple[str, list[str]]:
    token = obter_token()

    response = requests.post(
        f"{os.getenv('BASE_URL')}/ai/chat",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "message": pergunta,
            "session_id": "teste-ia-001",
            "agent_id": "1",
            "locale": "pt-BR",
            "user_profile": {
                "knowledgeLevel": "INTERMEDIATE",
                "role": "industrial_manager",
                "experienceRange": "less_than_1",
            },
        },
        timeout=120,
    )

    print("STATUS:", response.status_code)
    print("RESPOSTA:", response.text)

    assert response.status_code == 200

    return extrair_resposta_e_contextos(response)


async def avaliar_resposta_com_ragas(
    pergunta: str,
    resposta: str,
    contextos: list[str] | None = None,
) -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "available": False,
            "reason": "OPENAI_API_KEY not configured",
        }

    try:
        from openai import AsyncOpenAI
        from ragas.embeddings.base import embedding_factory
        from ragas.llms import llm_factory
        from ragas.metrics.collections import AnswerRelevancy, Faithfulness
    except ImportError as exc:
        return {
            "available": False,
            "reason": f"Missing RAGAS dependencies: {exc}",
        }

    client = AsyncOpenAI(api_key=api_key)
    llm_model = os.getenv("RAGAS_LLM_MODEL", "gpt-4o-mini")
    embedding_model = os.getenv("RAGAS_EMBEDDING_MODEL", "text-embedding-3-small")
    llm = llm_factory(llm_model, client=client)
    embeddings = embedding_factory("openai", model=embedding_model, client=client)

    resposta_llm = await AnswerRelevancy(llm=llm, embeddings=embeddings).ascore(
        user_input=pergunta,
        response=resposta,
    )

    resultado: dict[str, Any] = {
        "available": True,
        "answer_relevancy": resposta_llm.value,
        "faithfulness": None,
        "context_count": len(contextos or []),
    }

    if contextos:
        faithfulness = await Faithfulness(llm=llm).ascore(
            user_input=pergunta,
            response=resposta,
            retrieved_contexts=contextos,
        )
        resultado["faithfulness"] = faithfulness.value

    return resultado


def avaliar_resposta_sync(
    pergunta: str,
    resposta: str,
    contextos: list[str] | None = None,
) -> dict[str, Any]:
    return asyncio.run(avaliar_resposta_com_ragas(pergunta, resposta, contextos))
