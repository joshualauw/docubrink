export function toUpperUnderscore(input: string): string {
    return input.trim().replace(/\s+/g, "_").toUpperCase();
}

export function snakeToTitleCase(input: string): string {
    return input
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function genRandomAlphanum(length: number = 6): string {
    if (length <= 0 || !Number.isInteger(length)) {
        console.error("Invalid length parameter. Length must be a positive integer.");
        return "";
    }

    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}

export function slugify(text: string): string {
    return text
        .toLowerCase() // lowercase everything
        .normalize("NFD") // decompose accented chars like é -> e +  ́
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
        .trim() // trim whitespace from start/end
        .replace(/\s+/g, "-") // replace spaces with dashes
        .replace(/-+/g, "-"); // collapse multiple dashes
}

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        //@ts-ignore
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}

export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function getRandomAtRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function retryLoop<T>(fn: () => T | Promise<T>, maxAttempts = 3, delay = 0): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            console.log(`Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);

            if (attempt === maxAttempts) {
                throw lastError;
            }

            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}