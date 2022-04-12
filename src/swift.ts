/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ProgrammingLanguage } from "./types";

export const bundle = () => `
var ProgrammingGlobal : [String : (_ any : [Any?]) -> Any?] = [
    "slice" : { any in
        if let target = any[1] as? String, let from = any[2] as? Double {
            if any.count >= 3, let to = any[3] as? Double {
                if(to < 0) {
                    let start = target.index(target.startIndex, offsetBy: Int(from))
                    let end = target.index(target.startIndex, offsetBy: target.count + Int(to))
                    return String(target[start..<end])
                } else {
                    let start = target.index(target.startIndex, offsetBy: Int(from))
                    let end = target.index(target.startIndex, offsetBy: Int(to))
                    return String(target[start..<end])
                }
            } else {
                let start = target.index(target.startIndex, offsetBy: Int(from))
                let end = target.index(target.startIndex, offsetBy: target.count)
                return String(target[start..<end])
            }
        }
        if let target = any[1] as? [Any?], let from = any[2] as? Double {
            if any.count >= 3, let to = any[3] as? Double {
                if(to < 0) {
                    let start = target.index(target.startIndex, offsetBy: Int(from))
                    let end = target.index(target.startIndex, offsetBy: target.count + Int(to))
                    return Array(target[start..<end])
                } else {
                    let start = target.index(target.startIndex, offsetBy: Int(from))
                    let end = target.index(target.startIndex, offsetBy: Int(to))
                    return Array(target[start..<end])
                }
            } else {
                let start = target.index(target.startIndex, offsetBy: Int(from))
                let end = target.index(target.startIndex, offsetBy: target.count)
                return Array(target[start..<end])
            }
        }
        return []
    },
    "toString" : { any in
        if(any.count == 1) {
            return "\\(any[0])"
        }
        if let target = any[0] as? Double, let radix = any[1] as? Double {
            if radix == 16 {
                return String(format : "%02X", target)
            }
        }
        return nil
    },
    "substr" : { any in
        if
            any.count == 2,
            let target = any[0] as? String,
            let start = any[1] as? Double {
            let from = target.index(target.startIndex, offsetBy: Int(start))
            return String(target[from...])
        }
        if
            any.count == 3,
            let target = any[0] as? String,
            let start = any[1] as? Double,
            let end = any[2] as? Double {
            let from = target.index(target.startIndex, offsetBy: Int(start))
            let to = target.index(target.startIndex, offsetBy: Int(end))
            return String(target[from..<to])
        }
        return nil
    }
]

func setTimeout(ms : Double, callback : @escaping () -> ()) {
    DispatchQueue.main.asyncAfter(deadline: .now() + (ms / 1000.0)) {
        callback()
    }
}

var ProgrammingMath : [String : (_ any : [Any?]) -> Any?] = [
    "random" : { any in
        return Double(arc4random()) / Double(UINT32_MAX)
    }
]

var ProgrammingUnderscore : [String : (_ any : [Any?]) -> Any?] = [
    "compare" : { any in
        if let a = any[0] as? String, let b = any[1] as? String {
            let cr = a.compare(b)
            if cr == .orderedAscending {
                return Double(-1)
            }
            if cr == .orderedDescending {
                return Double(1)
            }
            return Double(0)
        }
        if let a = any[0] as? Double, let b = any[1] as? Double {
            return a - b
        }
        return 0
    },
    "upsert" : { any in
        if let list = any[0] as? [[String : Any?]],
           let item = any[1] as? [String : Any?] {
           let outerKey = item["key"] as? String
            let index = list.firstIndex(where : { member in
                let innerKey = member["key"] as? String
                return outerKey == innerKey
            }) ?? -1
            if index == -1 {
                return Array(list + [item])
            } else {
                let left = Array(list[0..<index])
                let right = Array(list[(index + 1)...])
                return Array(left + [item] + right)
            }
        }
        return nil
    },
    "indexOf" : { any in
        if 
            let target = any[0] as? [Any?], 
            let callback = any[1] as? (Any?) -> Any? {
            return Double(target.firstIndex(where : { item in
                return callback([
                    "item" : item
                ]) as? Bool ?? false
            }) ?? -1)
        }
        return nil
    },
    "find" : { any in
        if 
            let target = any[0] as? [Any?], 
            let callback = any[1] as? (Any?) -> Any? {
            return target.first(where : { item in
                return callback([
                    "item" : item
                ]) as? Bool ?? false
            }) ?? any[2]
        }
        return nil
    },
    "sort" : { any in
        if var target = any[0] as? [Any?], let callback = any[1] as? (Any?) -> Any? {
            target.sort {
                let value = callback([
                    "a" : $0,
                    "b" : $1
                ]) as? Double ?? 0
                return value < 0
            }
            return target
        }
        return nil
    },
    "includes" : { any in
        if let haystack = any[0] as? [Any?], let needle = any[1] {
            return haystack.contains {
                return equals(a : $0, b : needle)
            }
        }
        return nil
    },
    "assign": { any in
        if let maps = any as? [[String : Any?]] {
            var map = maps[0]
            for overwrite in maps[1...] {
                for (k, v) in overwrite {
                    map[k] = v
                }
            }
            return map
        }
        return nil
    },
    "reduce" : { any in
        if let target = any[0] as? [Any?], let callback = any[1] as? (Any?) -> Any?, let initial = any[2] as Any? {
            return target.reduce(initial) { total, item in
                return callback([
                    "item" : item,
                    "total": total
                ])
            }
        }
        return nil
    },
    "some" : { any in
        if let target = any[0] as? [Any?], let callback = any[1] as? (Any?) -> Any? {
            return target.contains {
                return hasValue(input : callback([
                    "item" : $0
                ]))
            }
        }
        return nil
    },
    "replace" : { any in
        if let haystack = any[0] as? String, let needle = any[1] as? String, let replace = any[2] as? String {
            return haystack.replacingOccurrences(of: needle, with: replace, options: .regularExpression, range: nil)
        }
        return nil
    },
    "map" : { any in
        if let target = any[0] as? [Any?], let callback = any[1] as? (Any?) -> Any? {
            return target.map {
                return callback([
                    "item" : $0
                ])
            }
        }
        return nil
    },
    "filter" : { any in
        if let target = any[0] as? [Any?], let callback = any[1] as? (Any?) -> Any? {
            return target.filter {
                return hasValue(input : callback([
                    "item" : $0
                ]))
            }
        }
        return nil
    },
    "concat" : { any in
        if let arrays = any as? [[Any?]] {
            var array: [Any?] = []
            for append in arrays {
                array += append
            }
            return array
        }
        return nil
    }
]

var ProgrammingDate : [String : (_ any : [Any?]) -> Any?] = [
    "now" : { any in
        return Double(Date().timeIntervalSince1970 * 1000)
    }
]

func gt(a : Any?, b : Any?) -> Bool {
    if let a = a as? Double, let b = b as? Double {
        return a > b
    }
    return false
}

func gte(a : Any?, b : Any?) -> Bool {
    if let a = a as? Double, let b = b as? Double {
        return a >= b
    }
    return false
}

func add(input : [Any?]) -> Any? {
    return input[1...].reduce(input[0], { total, item in
        if let total = total as? Double, let item = item  as? Double {
            return total + item
        }
        if let total = total as? String, let item = item  as? Double {
            return total + String(format : "%g", item)
        }
        if let total = total as? Double, let item = item  as? String {
            return String(format : "%g", total) + item
        }
        if let total = total as? String, let item = item as? String {
            return total + item
        }
        return total
    })
}

func sub(input : [Any?]) -> Any? {
    return input[1...].reduce(input[0], { total, item in
        if let total = total as? Double, let item = item  as? Double {
            return total - item
        }
        return total
    })
}

func div(input : [Any?]) -> Any? {
    return input[1...].reduce(input[0], { total, item in
        if let total = total as? Double, let item = item  as? Double {
            return total / item
        }
        return total
    })
}

func mult(input : [Any?]) -> Any? {
    return input[1...].reduce(input[0], { total, item in
        if let total = total as? Double, let item = item  as? Double {
            return total * item
        }
        return total
    })
}

func not(input : Any?) -> Bool {
    return !hasValue(input: input)
}

func isEqual<T: Equatable>(type: T.Type, a: Any, b: Any) -> Bool {
    guard let a = a as? T, let b = b as? T else {
        return false
    }

    return a == b
}

func equals(a: Any?, b: Any?) -> Bool {
    if a == nil && b == nil {
        return true
    }
    if a == nil || b == nil {
        return false
    }
    if let a = a as? String, let b = b as? String {
        return isEqual(type: String.self, a: a, b : b)
    }
    if let a = a as? Double, let b = b as? Double {
        return isEqual(type: Double.self, a: a, b : b)
    }
    if let a = a as? Bool, let b = b as? Bool {
        return isEqual(type: Bool.self, a: a, b : b)
    }
    return false
}

func hasValue(input : Any?) -> Bool {
    if input == nil {
        return false
    }
    if let string = input as? String {
        return string != ""
    }
    if let double = input as? Double {
        return double != 0
    }
    if let bool = input as? Bool {
        return bool
    }
    return true
}

func get(
    root: Any?,
    path: [Any?]
) -> Any? {
    return path.reduce(root, { total, part in
        if let total = total as? [String : Any?], let part = part as? String {
            return total[part]
        }
        if let total = total as? [Any?] {
            if let part = part as? Double {
                if 0 <= part && Int(part) < total.count {
                    return total[Int(part)]
                } else {
                    return nil
                }
            }
            if let part = part as? String, part == "length" {
                return Double(total.count)
            }
        }
        return total
    })
}

func set(
    root: Any?,
    path: [Any?],
    value: Any?
) -> Any? {
    if path.isEmpty {
        return value
    }
    let part = path[0]
    if var root = root as? [String : Any?], let part = part as? String {
        root[part] = set(root : root[part], path : Array(path[1...]), value : value)
        return root
    }
    if var root = root as? [Any?], let part = part as? Double {
        root[Int(part)] = set(root : root[Int(part)], path : Array(path[1...]), value : value)
        return root
    }
    return value
}

func invoke(
    target: Any?,
    name: String,
    args: [Any?]
) -> Any? {
    if let target = target as? [String : Any?] {
        if let callback = target[name] as? ([Any?]) -> Any? {
            return callback(args)
        }
    }
    if let callback = ProgrammingGlobal[name] as? ([Any?]) -> Any? {
        return callback([target] + args)
    }
    return nil
}
`;

const remap = {
	_ : "ProgrammingUnderscore",
	Date: "ProgrammingDate",
	Math: "ProgrammingMath"
};

export const render = (code: ProgrammingLanguage | undefined, tabs: string): unknown => {
	if(code === undefined) return "nil";
	if(code === null) return "nil";
	switch (code._name) {
	case "result":
		return `${tabs}return ${render(code.value, tabs)}`;
	case "declare": {
		const variables = Object.keys(code.variables).map(
			// @ts-ignore
			key => `${tabs}var ${key}: Any? = ${render(code.variables[key], tabs)}`
		).join("\n");
		const body = code.body.map(it => render(it, tabs)).join("\n");
		return `${variables}${variables ? `\n${body}` : body}`;
	}
	case "fallback": {
		return `${render(code.value, tabs)} ?? ${render(code.fallback, tabs)}`;
	}
	case "get": {
		const rest = code.variable.slice(1).map(it => render(it, tabs)).join(", ");
		// @ts-ignore
		const name = remap[code.variable[0]] ?? code.variable[0];
		return `get(
${tabs}\troot : ${typeof name === "string" ? name : render(name, `${tabs}\t\t`)},
${tabs}\tpath : [${rest ? `\n${tabs}\t\t${rest}\n${tabs}\t` : ""}]
${tabs})`;
	}
	case "set":
		return `${tabs}${code.variable[0]} = set(
${tabs}\troot : ${code.variable[0]},
${tabs}\tpath : [
${tabs}\t\t${code.variable.slice(1).map(it => render(it, `${tabs}\t\t\t`)).join(`,\n${tabs}\t\t\t`)}
${tabs}\t],
${tabs}\tvalue: ${render(code.value, `${tabs}\t`)}
${tabs})`;
	case "not":
		return `not(input : ${render(code.item, tabs)})`;
	case "add":
		return "add(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "sub":
		return "sub(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "mult":
		return "mult(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "div":
		return "div(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "or":
		return "(" + code.items.map(it => `hasValue(input : ${render(it, tabs)})`).join(" || ") + ")";
	case "and":
		return "(" + code.items.map(it => `hasValue(input : ${render(it, tabs)})`).join(" && ") + ")";
	case "gt":
		return `gt(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "lt":
		return `lt(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "gte":
		return `gte(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "eq":
		return `equals(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "condition": {
		const otherwise = code.otherwise ? ` else {
${render(code.otherwise, tabs + "\t")}
${tabs}}` : "";
		return `${tabs}if(hasValue(input : ${render(code.test, tabs)})) {
${render(code.then, tabs + "\t")}
${tabs}}${otherwise}`;
	}
	case "defined": {
		const value = render(code.item, tabs);
		return `hasValue(input : ${value})`;
	}
	case "fun": {
		const body = [
			...code.args.map(it => `${tabs}\tvar ${it} = get(root : args, path : ["${it}"])`),
			render(code.body, `${tabs}\t`)
		];
		if(code.name) {
			return `${tabs}ProgrammingGlobal["${code.name}"] = { list in
${tabs}\t${code.args.length ? "let args = list[1]" : ""}
${body.join("\n")}
${tabs}\treturn nil
${tabs}}`;
		}
		return `{ (args : Any?) -> Any? in
${body.join("\n")}
${tabs}\treturn nil
${tabs}}`;
	}
	case "invoke": {
		const target = render(code.target, `${tabs}\t`);
		const fun = code.fun;
		const args = code.args.map(it => render(it, `${tabs}\t\t`));
		const sideEffect = code.sideEffect;
		return `${sideEffect ? tabs : ""}invoke(
${tabs}\ttarget : ${target},
${tabs}\tname : "${fun}",
${tabs}\targs : [
${tabs}\t\t${args.join(`,\n${tabs}\t\t`)}
${tabs}\t]
${tabs})`;
	}
	default:
		// @ts-ignore
		if(code instanceof Array) {
			const content = `
${tabs}\t${
	// @ts-ignore
	code.map(it => render(it, `${tabs}\t`)).join(`,\n${tabs}\t`)
}
${tabs}`;
			// @ts-ignore
			return `[${code.length ? content : ""}]`;
		}
		if(typeof code === "object") {
			const keys = Object.keys(code);
			return keys.length ? `[
${tabs}\t${keys.map(key => `"${key}" : ${render(code[key], `${tabs}\t`)}`).join(`,\n\t${tabs}`)}
${tabs}]` : "[:]";
		}
		if(typeof code === "number") {
			return `Double(${code})`;
		}
		return JSON.stringify(code);
	}
};
