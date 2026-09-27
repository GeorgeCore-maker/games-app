import { useQuery } from "@tanstack/react-query";

const CHUCK_API = "https://api.chucknorris.io/jokes/random";
const TRANSLATE_API = "https://api.mymemory.translated.net/get";

type ChuckJoke = {
    value: string;
};

type Translation = {
    responseData: {
        translatedText: string;
    };
};

const translateToSpanish = async (text: string) => {
    const response = await fetch(
        `${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=en|es`
    );
    const data: Translation = await response.json();
    return data.responseData.translatedText;
};

const fetchSpanishJoke = async () => {
    const response = await fetch(CHUCK_API);
    const data: ChuckJoke = await response.json();
    return translateToSpanish(data.value);
};

export default function useChuck() {
    return useQuery({
        queryKey: ["chuck-joke"],
        queryFn: fetchSpanishJoke,
    });
}
