# polylingual
Write code once, reuse it anywhere

A simple programming api that allows you write javascript code. 

```js

// generate code configuration

const sayHello = code(({
    console,
    name
}) => block([
    console.log("hello", name)
])))

// generate code for given language

javascript(sayHello);

/*
console.log("hello", name);
*/

kotlin(sayHello);

/*
invoke(
    get(
        listOf(
            console
        )
    ),
    "log",
    listOf(
        "hello",
        get(
            listOf(
                name
            )
        )
    )
)
*/

swift(sayHello);

/*
invoke(
    target : get(
        root : console,
        path : []
    ),
    name : "log",
    args : [
        "hello",
        get(
            root : name,
            path : []
        )
    ]
)
*/

// execute the code

execute(sayHello, {
    name : "Logan"
})

```

Check out the [tests](https://github.com/nagolyhprum/polylingual/blob/main/LICENSE) for more examples.