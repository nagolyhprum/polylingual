export type ProgrammingUnderscore = {  
    join: (input : unknown[], separator : string) => string
    keys: <T>(input : T) => Array<keyof T>
    toLowerCase: (input : string) => string,
    split: (input : string, separator : string | RegExp, limit?: number) => string[],
    toString: (input : unknown) => string  
    toInt: (input : string) => number  
    toFloat: (input : string) => number
    replace: (haystack: string, needle: string | RegExp, replace: string) => string
    slice: <S, T extends string | Array<S>>(items: T, from : number, to?: number) => T
    reduce: <T, U>(items: T[], callback: (args: {
        item: T,
        index: number,
        total: U
    }) => ProgrammingLanguage, initial: U) => U
    indexOf: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => number
    some: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    every: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    forEach: <T>(items: T[], callback: (args: {
        item: T
        index: number
    }) => ProgrammingLanguage) => ProgrammingLanguage
    map: <T, U>(items: T[], callback: (args: {
        item: T
        index: number
        items : T[]
    }) => ProgrammingLanguage) => U[]
    filter: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => T[]
    includes: <T>(items: T[], item: T) => boolean
    concat: <T>(...lists: T[][]) => T[]
    assign: <T>(target: Partial<T>, ...overwrite: Array<Partial<T>>) => T
    find: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage, or: T | null) => T
    sort: <T>(items: T[], callback: (args: {
        a: T,
        b: T
    }) => ProgrammingLanguage) => T[]
    compare: <T>(a: T, b: T) => number
    upsert: <T extends {
        id: string | number
    } | {
        key: string | number
    }>(list: T[], item: T) => T[]
    shuffle: <T>(list : T[]) => T[]
}

export type ProgrammingLanguage = ({
    _name: "fallback",
    value: ProgrammingLanguage,
    fallback: ProgrammingLanguage
} | {
    _name: "execute",
    code: ProgrammingLanguage
} | {
    _name: "sub",
    items: ProgrammingLanguage[]
} | {
    _name: "and",
    items: ProgrammingLanguage[]
} | {
    _name: "or",
    items: ProgrammingLanguage[]
} | {
    _name: "add",
    items: ProgrammingLanguage[]
} | {
    _name: "mult",
    items: ProgrammingLanguage[]
} | {
    _name: "div",
    items: ProgrammingLanguage[]
} | {
    _name: "gt",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "lt",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "gte",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "eq",
    a: ProgrammingLanguage
    b: ProgrammingLanguage
} | {
    _name: "set",
    variable: ProgrammingLanguage[],
    value: ProgrammingLanguage
} | {
    _name: "invoke",
    target: ProgrammingLanguage,
    fun: string,
    args: ProgrammingLanguage[]
    sideEffect?: boolean
} | {
    _name: "get",
    variable: ProgrammingLanguage[]
} | {
    _name: "declare",
    variables: {
        [key: string]:unknown
    },
    body: ProgrammingLanguage[]
} | {
    _name: "result",
    value: ProgrammingLanguage
} | {
    _name: "fun",
    name: string
    args: string[],
    body: ProgrammingLanguage
} | {
    _name: "condition",
    test: ProgrammingLanguage,
    then: ProgrammingLanguage,
    otherwise?: ProgrammingLanguage
} | {
    _name: "not",
    item: ProgrammingLanguage
} | {
    _name: "defined"
    item: ProgrammingLanguage
}) & {
    dependencies?: string[]
}

export type ProgrammingDate = {
    now: () => number
}

export type ProgrammingTimeout = (callback: () => ProgrammingLanguage, ms: number) => ProgrammingLanguage

export type ProgrammingNamedTimeout = (key : string, callback: () => ProgrammingLanguage, ms: number) => ProgrammingLanguage

export type ProgrammingJSON = {
    stringify(input: any, replacer? : unknown, space? : string): string
    parse(input: string): any
}

export type ProgrammingFetch = (url: string, config: {
    body?: Blob | File | string
    headers?: Record<string, string>
    method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH"
    callback?: (config : {
        response: {
            status: number
            body: string
            headers: Record<string, string>
        }
        error: Error
    }) => ProgrammingLanguage
    credentials?: "omit" | "same-origin" | "include"
}) => ProgrammingLanguage

export type ProgrammingConsole = {
    log : (...args : unknown[]) => ProgrammingLanguage
}

export type ProgrammingBaseScope = {
	Math: Math,
	console: ProgrammingConsole
	Date: ProgrammingDate
	setTimeout: ProgrammingTimeout
	debounce: ProgrammingNamedTimeout
	throttle: ProgrammingNamedTimeout
	JSON: ProgrammingJSON
	_: ProgrammingUnderscore
	fetch: ProgrammingFetch
    promise : <T>(callback : (config : {
        resolve : (result : T) => ProgrammingLanguage
        reject : (error : Error) => ProgrammingLanguage
    }) => void) => Promise<T>
}