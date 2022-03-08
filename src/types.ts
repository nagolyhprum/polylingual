export type ProgrammingUnderscore = {  
    toLowerCase: (input : string) => string,
    split: (input : string, token : string) => string[],
    toString: (input : unknown) => string  
    replace: (haystack: string, needle: string, replace: string) => string
    slice: <T>(items: T[], from : number, to : number) => T[]
    reduce: <T, U>(items: T[], callback: (args: {
        item: T,
        total: U
    }) => ProgrammingLanguage, initial: U) => U
    indexOf: <T>(items: T[], callback: (args: {
        item: T
    }) => boolean) => number
    some: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    every: <T>(items: T[], callback: (args: {
        item: T
    }) => ProgrammingLanguage) => boolean
    forEach: <T>(items: T[], callback: (args: {
        item: T
        index: number
    }) => ProgrammingLanguage) => void
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
}

export type ProgrammingLanguage = {
    _name: "fallback",
    value: ProgrammingLanguage,
    fallback: ProgrammingLanguage
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
}

export type ProgrammingDate = {
    now: () => number
}

export type ProgrammingTimeout = (callback: () => ProgrammingLanguage, ms: number) => number

export type ProgrammingJSON = {
    stringify(input: unknown, replacer? : unknown, space? : string): string
    parse(input: string): unknown
}

export type ProgrammingFetch = (url: string, config: {
    body?: string
    headers?: Record<string, string>
    method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH"
    callback?: (response: {
        status: number
        body: string
        headers: Record<string, string>
    }) => ProgrammingLanguage
}) => ProgrammingLanguage

export type ProgrammingConsole = {
    log : (...args : unknown[]) => ProgrammingLanguage
}

export type ProgrammingBaseScope = {
	Math: Math,
	console: ProgrammingConsole
	Date: ProgrammingDate
	setTimeout: ProgrammingTimeout
	JSON: ProgrammingJSON
	_: ProgrammingUnderscore
	fetch: ProgrammingFetch
}