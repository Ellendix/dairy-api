from ia_avaluation.ragas_utils import chamar_ia, avaliar_resposta_sync


def test_ia_responde_sobre_pasta_filata():
    pergunta = "O que caracteriza um queijo de pasta filata e de que depende sua elasticidade?"
    resposta, contextos = chamar_ia(
        pergunta
    )

    avaliacao = avaliar_resposta_sync(
        pergunta,
        resposta,
        contextos,
    )

    print("RAGAS:", avaliacao)

    if avaliacao["available"]:
        assert avaliacao["answer_relevancy"] >= 0.5
        if avaliacao["faithfulness"] is not None:
            assert avaliacao["faithfulness"] >= 0.5

    texto = resposta.lower()

    assert "fil" in texto
    assert "elastic" in texto
