import { useQuery } from "@tanstack/react-query";

const CHUCK_API = "https://api.chucknorris.io/jokes/random";
const TRANSLATE_API = "https://api.mymemory.translated.net/get";

type ChuckJoke = {
    value: string;
};

type TranslationResponse = {
    responseData?: {
        translatedText?: string;
    };
};

/**
 * MyMemory es un servicio gratuito con limite de peticiones. Cuando se pasa de
 * cuota devuelve el texto original o un cuerpo vacio, y `translatedText` deja
 * de existir: acceder a mano a esa propiedad rompia con TypeError y hacia
 * fallar el chiste entero aunque ya se hubiera traído bien.
 */
const translateToSpanish = async (text: string) => {
    const response = await fetch(
        `${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=en|es`
    );

    if (!response.ok) {
        // Se devuelve el original: mejor un chiste en ingles que ningun chiste.
        return text;
    }

    const data = (await response.json()) as TranslationResponse;
    return data.responseData?.translatedText?.trim() || text;
};

const fetchSpanishJoke = async () => {
    const response = await fetch(CHUCK_API);

    if (!response.ok) {
        throw new Error(`Chuck Norris API respondio ${response.status}`);
    }

    const data = (await response.json()) as ChuckJoke;
    if (!data.value) {
        throw new Error("La API de chistes no devolvio texto");
    }

    return translateToSpanish(data.value);
};

export default function useChuck() {
    return useQuery({
        queryKey: ["chuck-joke"],
        queryFn: fetchSpanishJoke,
        // El chiste es decorativo: si falla, no tiene sentido reintentar ni
        // dejar la pantalla bloqueada esperando.
        retry: 1,
    });
}
