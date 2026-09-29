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
 * MyMemory tiene limite de peticiones y al pasarse devuelve `translatedText`
 * ausente. Mirar esa propiedad a mano rompia con TypeError.
 */
const translateToSpanish = async (text: string) => {
    const response = await fetch(
        `${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=en|es`
    );

    if (!response.ok) {
        // Mejor un chiste en ingles que ningun chiste.
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
  // Decorativo: si falla, no se reintenta ni se bloquea la pantalla.
        retry: 1,
    });
}
