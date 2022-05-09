/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ProgrammingLanguage } from "./types";

export const bundle = (dependencies : Set<string>) => [{
	dependency : "_",
	code : "var _ = {}"
}, {
	dependency : "_.slice",
	code: `
_.slice = function(list, from, to) {
	return list.slice(from, to);
};`},{
	dependency: "_.replace",
	code: `
_.replace = function(input, find, replace) {
	return input.replace(typeof find === "object" ? new RegExp(find.pattern, find.flags) : find, replace)
};`
},{
	dependency: "_.split",
	code: `
_.split = function(input, separator, limit) {
	return input.split(typeof separator === "object" ? new RegExp(separator.pattern, separator.flags) : separator, limit)
};`
},{
	dependency : "_.sort",
	code : `
_.sort = function(list, callback) {
	return list.sort(function (a, b) {
		return callback({
			a : a,
			b : b
		});
	});
};`
},{
	dependency : "_.reduce",
	code : `
_.reduce = function(list, callback, start) {
	return list.reduce(function(total, item) {
		return callback({
			total : total,
			item : item
		})
	}, start);
};`
},{
	dependency : "_.upsert",
	code : `
_.upsert = function(list, upsert) {
	var item = list.find(function(item) {
		return (item.id && upsert.id && item.id === upsert.id) || (item.key && upsert.key && item.key === upsert.key)
	})
	if(item) {
		var index = list.indexOf(item);
		return [].concat(list.slice(0, index), [Object.assign(item, upsert)], list.slice(index + 1));
	} else {
		return list.concat([upsert]);
	}
};
`
},{
	dependency : "_.keys",
	code : `
_.keys = function(target) {
	return Object.keys(target);
};
`
},{
	dependency : "_.assign",
	code : `
_.assign = function() {
	return Object.assign.apply(null, arguments);
};`
},{
	dependency : "_.toLowerCase",
	code : `
_.toLowerCase = function(target) {
	return target.toLowerCase();
};`
},{
	dependency : "_.forEach",
	code : `
_.forEach = function(list, callback) {
	return list.forEach(function(item, index, items) {
		return callback({
			item : item,
			index : index,
			items : items
		})
	})
};`
},{
	dependency : "_.map",
	code : `
_.map = function(list, callback) {
	return list.map(function(item, index, items) {
		return callback({
			item : item,
			index : index,
			items : items
		})
	})
};`
},{
	dependency : "_.filter",
	code : `
_.filter = function(list, callback) {
	return list.filter(function(item, index) {
		return callback({
			item : item,
			index : index
		})
	})
};`
},{
	dependency : "_.toString",
	code : `
_.toString = function(input) {
	return "" + input;
};`
},{
	dependency : "_.concat",
	code : `
_.concat = function() {
	return [].concat.apply([], arguments);
};
`
},{
	dependency : "_.indexOf",
	code : `
_.indexOf = function(list, callback) {
	var item = list.find(function(item) {
		return callback({
			item : item
		});
	});
	return list.indexOf(item);
};`
},{
	dependency : "_.find",
	code : `
_.find = function(list, callback, or) {
	return list.find(function(item) {
		return callback({
			item : item
		});
	}) || or;
};`
},{
	dependency : "_.compare",
	code : `
_.compare = function(a, b) {
	return a.localeCompare(b);
};`
},{
	dependency : "fetch",
	code : `
var fetch = (function(url, config) {
	var windowFetch = fetch;
	return function(url, config) {
		windowFetch(url, {
			method : config.method,
			body : config.body,
			headers : config.headers
		}).then(function(res) {
			return res.text().then(function(text) {
				config.callback({
					response : {
						status : res.status,
						body : text,
						headers : res.headers
					}
				});
				update();
			})
		}).catch(function(error) {
			config.callback({
				error : error
			});
			update();
		});
	}
})();`
}].filter(({ 
	dependency 
}) => dependencies.has(dependency)).map(
	it => it.code.trim()
).join("\n") + `
var fallback = function(a, b) {
	return a === undefined || a === null ? b : a;
};`;

const variableRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

const wrapKey = (input: string) => {
	if(input.match(variableRegexp)) {
		return input;
	}
	return `"${input}"`;
};

const renderPath = (path: ProgrammingLanguage[], tabs: string) => {
	return path.map((it, index) => {
		if(typeof it === "string") return `${index ? "." : ""}${it}`;
		return index ? `[${render(it, tabs)}]` : render(it, tabs);
	}).join("");
};

export const render = (code: ProgrammingLanguage | undefined, tabs: string): string => {
	if(code === null) return "null";
	if(code === undefined) return "";
	if(code instanceof RegExp) {
		return render({
			pattern : code.source,
			flags : code.flags
		} as any, tabs);
	}
	switch (code._name) {
	case "condition": {
		const otherwise = code.otherwise ? ` else {
${render(code.otherwise, tabs + "\t")}
${tabs}}` : "";
		return `${tabs}if(${render(code.test, tabs)}) {
${render(code.then, tabs + "\t")}
${tabs}}${otherwise}`;
	}
	case "declare": {
		const keys = Object.keys(code.variables);
		const variables = keys.length ? `${tabs}var ${
			keys.map((key) => {
				// @ts-ignore
				return `${key} = ${render(code.variables[key], tabs)}`;
			})
				.join(", ")};\n` : "";
		const body = code.body.map(it => render(it, tabs)).join("\n");
		return `${variables}${body}`;
	}
	case "set":
		return `${tabs}${renderPath(code.variable, tabs)} = ${render(code.value, tabs)};`;
	case "get":
		return renderPath(code.variable, tabs);
	case "invoke": {
		const target = render(code.target, tabs);
		const fun = code.fun;
		const args = code.args.map(it => render(it, tabs));
		const sideEffect = code.sideEffect;
		return `${sideEffect ? tabs : ""}${target}${target ? "." : ""}${fun}(${args.join(", ")})${sideEffect ? ";" : ""}`;
	}
	case "not":
		return `!(${render(code.item, tabs)})`;
	case "add":
		return "(" + code.items.map(it => render(it, tabs)).join(" + ") + ")";
	case "sub":
		return "(" + code.items.map(it => render(it, tabs)).join(" - ") + ")";
	case "mult":
		return "(" + code.items.map(it => render(it, tabs)).join(" * ") + ")";
	case "div":
		return "(" + code.items.map(it => render(it, tabs)).join(" / ") + ")";
	case "or":
		return "(" + code.items.map(it => render(it, tabs)).join(" || ") + ")";
	case "and":
		return "(" + code.items.map(it => render(it, tabs)).join(" && ") + ")";
	case "gt":
		return `(${render(code.a, tabs)} > ${render(code.b, tabs)})`;
	case "lt":
		return `(${render(code.a, tabs)} < ${render(code.b, tabs)})`;
	case "gte":
		return `(${render(code.a, tabs)} >= ${render(code.b, tabs)})`;
	case "eq":
		return `(${render(code.a, tabs)} === ${render(code.b, tabs)})`;
	case "result":
		return `${tabs}return ${render(code.value, tabs)};`;
	case "fun": {
		const body : string[] = [
			...code.args.map(it => `${tabs}\tvar ${it} = args.${it};`),
			render(code.body, `${tabs}\t`)
		];
		return `function ${code.name}(${code.args.length ? "args" : ""}) {
${body.join("\n")}
${tabs}}`;
	}
	case "defined": {
		const value = render(code.item, "");
		return `${value} !== undefined && ${value} !== null`;
	}
	case "fallback": {
		const value = render(code.value, tabs);
		const fallback = render(code.fallback, tabs);
		return `fallback(${value}, ${fallback})`;
	}
	default:
		// @ts-ignore
		if(code instanceof Array) {
			// @ts-ignore
			return `[${code.map(it => render(it, tabs)).join(", ")}]`;
		}
		if(typeof code === "object") {
			const keys = Object.keys(code);
			return keys.length ? `{
${tabs}\t${keys.map(key => `${wrapKey(key)}: ${render(code[key], `${tabs}\t`)}`).join(`,\n\t${tabs}`)}
${tabs}}` : "{}";
		}
		return JSON.stringify(code);
	}
};