/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ProgrammingLanguage } from "./types";

const remap = {
	_ : "Underscore"
};

export const bundle = () => `

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.locks.ReentrantLock
import kotlin.math.pow

fun getIdentifier(input : Any?) : Any? {
    if(input is Map<*, *>) {
        return input["key"] ?: input["id"]
    }
    return null
}

fun executor(max: Int, makeThread: (() -> Unit) -> Unit): (() -> Unit) -> Unit {
    val lock = ReentrantLock()
    val queue = LinkedList<() -> Unit>()
    var running = 0
    return {
        lock.lock()
        queue.add(it)
        if (running < max) {
            running++
            makeThread {
                while (true) {
                    lock.lock()
                    val next = queue.poll()
                    if (next != null) {
                        lock.unlock()
                        next()
                    } else {
                        running--
                        lock.unlock()
                        break
                    }
                }
            }
        }
        lock.unlock()
    }
}

val mainExecutor = executor(1) {
    Handler(Looper.getMainLooper()).post(it)
}

fun main(callback : () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper()) {
        Log.d("executor", "already in main")
    }
    mainExecutor(callback)
}

val backgroundExecutor = executor(1) {
    Thread(it).start()
}

fun background(callback : () -> Unit) {
    if (Looper.myLooper() != Looper.getMainLooper()) {
        Log.d("executor", "already in background")
    }
    backgroundExecutor(callback)
}

interface Extension {
    fun call(vararg args: Any?): Any?
}

interface ArgumentCallback {
    fun call(args: Any?): Any?
}

val extensions = mutableMapOf<String, Extension>(
    "isSame" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val time = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val unit = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if(receiver is ProgrammingMoment && unit is String && time is Double) {
                val moment = Calendar.getInstance()
                moment.timeInMillis = receiver.ms.toLong()
                val compare = Calendar.getInstance()
                compare.timeInMillis = time.toLong()
                if(unit == "day") {
                    return moment.get(Calendar.YEAR) == compare.get(Calendar.YEAR) && moment.get(Calendar.MONTH) == compare.get(Calendar.MONTH) && moment.get(Calendar.DAY_OF_MONTH) == compare.get(Calendar.DAY_OF_MONTH)
                }
            }
            throw NotImplementedError("isSame for $args")
        }
    },
    "api" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val config = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if (config is Map<*, *>) {
                val data = config["data"]
                val execute = config["execute"]
                val callback = config["callback"]
                val json = JSON.stringify(mutableMapOf(
                    "data" to data,
                    "execute" to when(execute) {
                        is String -> JSON.parse(execute)
                        else -> ""
                    }
                ))
                val queue = com.android.volley.toolbox.Volley.newRequestQueue(MainActivity.activity)
                val url = "https://www.speaknatively.com/api"
                val stringRequest = object : com.android.volley.toolbox.StringRequest(
                        Method.POST,
                        url,
                        { response ->
                            if(callback is ArgumentCallback) {
                                callback.call(mutableMapOf(
                                        "data" to JSON.parse(response)
                                ))
                            }
                        },
                        {

                        },

                ) {
                    override fun getBodyContentType(): String {
                        return "application/json; charset=utf-8"
                    }

                    override fun getBody(): ByteArray {
                        return json.toByteArray(Charsets.UTF_8)
                    }
                }
                queue.add(stringRequest)
                return null
            }
            throw NotImplementedError("api for $args")
        }
    },
    "compare" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val a = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val b = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && a is Comparable<*> && b is Comparable<*>) {
                return (a as Comparable<Any?>).compareTo(b as Any?)
            }
            throw NotImplementedError("compare for $args")
        }
    },
    "start" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val config = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if (receiver is PollySpeechRecognition && config is Map<*, *>) {
                val callback = config["onResult"]
                if (callback is ArgumentCallback) {
                    speechRecognitionCallback = callback
                    if (ContextCompat.checkSelfPermission(
                                    MainActivity.activity,
                                    Manifest.permission.RECORD_AUDIO
                            ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            ActivityCompat.requestPermissions(
                                    MainActivity.activity,
                                    listOf(
                                            Manifest.permission.RECORD_AUDIO
                                    ).toTypedArray(),
                                    SPEECH_REQUEST_CODE
                            )
                        }
                    } else {
                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                        intent.putExtra(
                                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                        )
                        if(config.containsKey("lang")) {
                            val lang = config["lang"]
                            if(lang is String) {
                                intent.putExtra(
                                    RecognizerIntent.EXTRA_LANGUAGE,
                                    lang
                                )
                            }
                        }
                        MainActivity.activity.startActivityForResult(intent, SPEECH_RESULT_CODE)
                    }
                }
                return null
            }
            throw NotImplementedError("start for $args")
        }
    },
    "moment" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val ms = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if (ms is Double) {
                return ProgrammingMoment(ms)
            }
            throw NotImplementedError("moment for $args")
        }
    },
    "includes" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val needle = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*>) {
                return list.contains(needle)
            }
            throw NotImplementedError("includes for $args")
        }
    },
    "split" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val source = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val token = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if(receiver is ProgrammingUnderscore && source is String && token is String) {
                return source.split(Regex(token))
            }
            throw NotImplementedError("toLowerCase for $args")
        }
    },
    "toLowerCase" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val string = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if(receiver is ProgrammingUnderscore && string is String) {
                return string.toLowerCase()
            }
            throw NotImplementedError("toLowerCase for $args")
        }
    },
    "toString" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val radix = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if (receiver is Double && radix is Double) {
                return receiver.toBigDecimal().toPlainString().split(".").map {
                    it.toLong().toString(radix.toInt())
                }.joinToString(".")
            }
            if (receiver is ProgrammingUnderscore) {
                if(radix is Double) {
                    val otherSymbols = DecimalFormatSymbols()
                    val df = DecimalFormat("#.##########", otherSymbols)
                    return df.format(radix)
                }
                return "$radix"
            }
            throw NotImplementedError("toString for $args")
        }
    },
    "substr" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val startIndex = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val endIndex = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is String && startIndex is Double && endIndex is Double) {
                return receiver.substring(startIndex.toInt(), endIndex.toInt())
            }
            if (receiver is String && startIndex is Double) {
                return receiver.substring(startIndex.toInt())
            }
            throw NotImplementedError("substr for $args")
        }
    },
    "assign" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val target = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val overwrite = when (args.size >= 1) {
                true -> args.asSequence().toList().subList(1, args.size)
                false -> null
            }
            val allMaps = overwrite?.all {
                it is MutableMap<*, *>
            } ?: false
            if (receiver is ProgrammingUnderscore && target is MutableMap<*, *> && allMaps) {
                return overwrite?.fold(mutableMapOf<String, Any?>()) { total, item ->
                    total.putAll(item as MutableMap<String, Any?>)
                    total
                }
            }
            throw NotImplementedError("assign for $args")
        }
    },
    "reduce" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            val initial = when (args.size >= 4) {
                true -> args[3]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.foldIndexed(initial) { index, total, item ->
                    callback.call(
                            mapOf(
                                    "item" to item,
                                    "total" to total,
                                    "index" to index.toDouble()
                            )
                    )
                }
            }
            throw NotImplementedError("reduce for $args")
        }
    },
    "speak" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val config = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if (receiver is PollyTTS && config is Map<*, *>) {
                val lang = config["lang"] as? String ?: "en-US"
                val rate = (config["rate"] as? Double ?: 1).toFloat()
                val text = config["text"] as? String ?: ""
                val tts = MainActivity.tts
                tts.language = Locale(lang)
                tts.setSpeechRate(rate)
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null)
                return null
            }
            throw NotImplementedError("speak for $args")
        }
    },
    "replace" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val haystack = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val needle = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            val replace = when (args.size >= 4) {
                true -> args[3]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && haystack is String && needle is String && replace is String) {
                return haystack.replace(Regex(needle), replace)
            }
            throw NotImplementedError("replace for $args")
        }
    },
    "forEach" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.forEachIndexed { index, item ->
                    callback.call(
                            mapOf(
                                    "item" to item,
                                    "index" to index.toDouble()
                            )
                    )
                }
            }
            throw NotImplementedError("map for $args")
        }
    },
    "log" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val values = args.asList().subList(1, args.size)
            if (receiver is ProgrammingConsole) {
                Log.d("console.log", "$values")
                return null
            }
            throw NotImplementedError("log for $args")
        }
    },
    "pow" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val a = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val b = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingMath && a is Double && b is Double) {
                return a.pow(b)
            }
            throw NotImplementedError("pow for $args")
        }
    },
    "map" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.mapIndexed { index, item ->
                    callback.call(
                            mapOf(
                                    "item" to item,
                                    "index" to index.toDouble()
                            )
                    )
                }
            }
            throw NotImplementedError("map for $args")
        }
    },
    "filter" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.filter { item ->
                    hasValue(
                            callback.call(
                                    mapOf(
                                            "item" to item
                                    )
                            )
                    )
                }
            }
            throw NotImplementedError("filter for $args")
        }
    },
    "indexOf" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                val item = list.find { item ->
                    hasValue(
                            callback.call(
                                    mapOf(
                                            "item" to item
                                    )
                            )
                    )
                }
                return list.indexOf(item).toDouble()
            }
            throw NotImplementedError("indexOf for $args")
        }
    },
    "date" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val config = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            if (receiver is PollyPicker && config is Map<*, *>) {
                receiver.date(config as Map<String, Any?>)
                return null
            }
            throw NotImplementedError("date for $args")
        }
    },
    "find" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            val or = when (args.size >= 4) {
                true -> args[3]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.find { item ->
                    hasValue(
                            callback.call(
                                    mapOf(
                                            "item" to item
                                    )
                            )
                    )
                } ?: or
            }
            throw NotImplementedError("find for $args")
        }
    },
    "every" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.all { item ->
                    hasValue(
                            callback.call(
                                    mapOf(
                                            "item" to item
                                    )
                            )
                    )
                }
            }
            throw NotImplementedError("every for $args")
        }
    },
    "some" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.any { item ->
                    hasValue(
                            callback.call(
                                    mapOf(
                                            "item" to item
                                    )
                            )
                    )
                }
            }
            throw NotImplementedError("some for $args")
        }
    },
    "sort" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val list = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val callback = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && list is List<*> && callback is ArgumentCallback) {
                return list.sortedWith { a, b ->
                    (callback.call(
                            mapOf(
                                    "a" to a,
                                    "b" to b
                            )
                    ) as Number).toInt()
                }
            }
            throw NotImplementedError("sort for $args")
        }
    },
    "concat" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val target = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val rest = when (args.size >= 3) {
                true -> args.asSequence().toList().subList(2, args.size)
                false -> null
            }
            val isLists = rest?.all {
                it is List<*>
            } ?: false
            if (receiver is ProgrammingUnderscore && target is List<*> && isLists) {
                return rest?.fold(target) { total, item ->
                    total + (item as List<Map<String, Any?>>)
                }
            }
            throw NotImplementedError("concat for $args")
        }
    },
    "upsert" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val haystack = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val needle = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && haystack is List<*> && needle is MutableMap<*, *>) {
                val item = haystack.find {
                    it is MutableMap<*, *> && getIdentifier(it) == getIdentifier(needle)
                }
                if (item is MutableMap<*, *>) {
                    val index = haystack.indexOf(item)
                    return haystack.subList(0, index) + listOf(needle) + haystack.subList(
                            index + 1,
                            haystack.size
                    )
                } else {
                    return haystack + listOf(needle)
                }
            }
            throw NotImplementedError("upsert for $args")
        }
    },
    "slice" to object : Extension {
        override fun call(vararg args: Any?): Any? {
            val receiver = args[0]
            val target = when (args.size >= 2) {
                true -> args[1]
                false -> null
            }
            val from = when (args.size >= 3) {
                true -> args[2]
                false -> null
            }
            val tempTo = when (args.size >= 4) {
                true -> args[3]
                false -> null
            }
            if (receiver is ProgrammingUnderscore && target is MutableList<*> && from is Double && tempTo is Double?) {
                val to = tempTo ?: target.size.toDouble()
                return if(from >= to) {
                    mutableListOf()
                } else if(to > target.size) {
                    target.subList(from.toInt(), target.size)
                } else if(to < 0) {
                    target.subList(from.toInt(), (target.size + to).toInt())
                } else {
                    target.subList(from.toInt(), to.toInt())
                }
            }
            if (receiver is ProgrammingUnderscore && target is String && from is Double && tempTo is Double?) {
                val to = tempTo ?: target.length.toDouble()
                return if(from >= to) {
                    ""
                } else if(to > target.length) {
                    target.substring(from.toInt(), target.length)
                } else if(to < 0) {
                    target.substring(from.toInt(), (target.length + to).toInt())
                } else {
                    target.substring(from.toInt(), to.toInt())
                }
            }
            throw NotImplementedError("slice for $args")
        }
    }
)

class PollyTTS

class ProgrammingMoment(
        val ms: Double
) {
    fun format(format: String): String {
        val formatter = SimpleDateFormat(
                format
                        .replace("ddd", "E") // show proper day name
                        .replace("D", "d") // show proper date
        )
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = ms.toLong()
        return formatter.format(calendar.time)
    }

    fun startOf(field: String): ProgrammingMoment {
        val cal = Calendar.getInstance()
        cal.timeInMillis = ms.toLong()
        if (listOf("year").contains(field)) {
            cal.set(Calendar.MONTH, 0)
        }
        if (listOf("year", "month").contains(field)) {
            cal.set(Calendar.DAY_OF_MONTH, 0)
        }
        if (listOf("year", "month", "day").contains(field)) {
            cal.set(Calendar.HOUR, 0)
        }
        if (listOf("year", "month", "day", "hour").contains(field)) {
            cal.set(Calendar.MINUTE, 0)
        }
        if (listOf("year", "month", "day", "hour", "minute").contains(field)) {
            cal.set(Calendar.SECOND, 0)
        }
        if (listOf("year", "month", "day", "hour", "minute", "second").contains(field)) {
            cal.set(Calendar.MILLISECOND, 0)
        }
        return ProgrammingMoment(cal.timeInMillis.toDouble())
    }

    fun valueOf(): Double {
        return ms
    }
}

class JSON {
    companion object {
        fun parse(input: String?): MutableMap<String, Any?>? {
            if(input == null) return null
            return parse(JSONObject(input)) as MutableMap<String, Any?>
        }

        private fun parse(input: Any?): Any? {
            if (input is JSONArray) {
                return 0.until(input.length()).fold(mutableListOf<Any?>()) { total, index ->
                    total.add(parse(input[index]))
                    total
                }
            }
            if (input is JSONObject) {
                return input.keys().asSequence().toList()
                    .fold(mutableMapOf<String, Any?>()) { total, key ->
                        total[key] = parse(input.get(key))
                        total
                    }
            }
            if(input is Number) {
                return input.toDouble()
            }
            return input
        }

        fun stringify(input: MutableMap<String, Any?>?): String {
            return stringify(input as Any?).toString()
        }

        private fun stringify(input: Any?): Any? {
            if (input is Map<*, *>) {
                return input.keys.toList().fold(JSONObject()) { total, key ->
                    if (key is String) {
                        total.put(key, stringify(input[key]))
                    }
                    total
                }
            }
            if (input is List<*>) {
                return input.fold(JSONArray()) { total, item ->
                    total.put(stringify(item))
                    total
                }
            }
            return input
        }
    }
}

fun setTimeout(callback: () -> Unit, ms: Long) {
    Handler(Looper.getMainLooper()).postDelayed({
        background {
            callback()
            updateAll("setTimeout")
        }
    }, ms)
}

class ProgrammingDate {
    fun now(): Double {
        return System.currentTimeMillis().toDouble()
    }
}

class ProgrammingMath {
    fun random(): Double {
        return java.lang.Math.random()
    }
}

class ProgrammingUnderscore

class ProgrammingConsole

fun invoke(target: Any?, name: String, args: List<Any?>): Any? {
    val types = args.map {
        it?.javaClass
    }.toTypedArray()
    if(target != null) {
        try {
            return target.javaClass.getMethod(name, *types).invoke(target, *args.toTypedArray())
        } catch (e: NoSuchMethodException) {
        }
    }
    val method = extensions[name]
    if (method != null) {
        return method.call(target, *args.toTypedArray())
    }
    throw NotImplementedError("$name for $target")
}

fun get(path: List<Any?>): Any? {
    if (path.isEmpty()) return extensions
    return path.subList(1, path.size).fold(path.first(), { target, key ->
        if (target is Map<*, *> && key is String) {
            (target as MutableMap<String, Any?>)[key]
        } else if (target is List<*>) {
            when (key) {
                is Double -> {
                    val index = key.toInt()
                    val list = target as MutableList<Any>
                    if (0 <= index && index < list.size) {
                        list[index]
                    } else {
                        null
                    }
                }
                "length" -> target.size.toDouble()
                else -> throw NotImplementedError("get $key for $target")
            }
        } else {
            return null
            // throw NotImplementedError("get $key for $target")
        }
    })
}

fun set(path: List<Any?>, value: Any?): Any? {
    if (path.size <= 1) return value
    val target = get(path.subList(0, path.size - 1))
    val key = path.last()
    if (target is MutableMap<*, *> && key is String) {
        (target as MutableMap<String, Any?>)[key] = value
        return value
    } else if (target is MutableList<*> && key is Double) {
        val list = target as MutableList<Any?>
        val index = key.toInt()
        while (index >= list.size) {
            list.add(null)
        }
        list[index] = value
        return value
    } else if (target is Component && key is String) {
        target.set(key, value)
        return value
    } else {
        throw NotImplementedError("set $key for $target")
    }
}

fun hasValue(input: Any?): Boolean {
    if ((input == "").or(input == false).or(input == null).or(input == 0)) {
        return false
    }
    return true
}

val nf = DecimalFormat("0.#")

fun add(vararg inputs: Any?): Any? {
    return inputs.asSequence().toList().subList(1, inputs.size).fold(inputs[0], { total, input ->
        if (total is Double && input is String) {
            nf.format(total) + input
        } else if (total is String && input is Double) {
            total + nf.format(input)
        } else if (total is Double && input is Double) {
            total + input
        } else {
            total.toString() + input.toString()
        }
    })
}

fun div(vararg inputs: Any?): Any? {
    return inputs.asSequence().toList().subList(1, inputs.size).fold(inputs[0], { total, number ->
        if (total is Double && number is Double) {
            total / number
        } else {
            total
        }
    })
}

fun sub(vararg inputs: Any?): Any? {
    return inputs.asSequence().toList().subList(1, inputs.size).fold(inputs[0], { total, number ->
        if (total is Double && number is Double) {
            total - number
        } else {
            total
        }
    })
}

fun mult(vararg inputs: Any?): Any? {
    return inputs.fold(1.0, { total, number ->
        if (number is Double) {
            total * number
        } else {
            total
        }
    })
}

fun gt(a: Any?, b: Any?): Boolean {
    if (a is Double && b is Double) {
        return a > b
    }
    return false
}

fun lt(a: Any?, b: Any?): Boolean {
    if (a is Double && b is Double) {
        return a < b
    }
    return false
}

fun gte(a: Any?, b: Any?): Boolean {
    if (a is Double && b is Double) {
        return a >= b
    }
    return false
}

fun not(input: Any?): Boolean {
    if (input is Boolean) {
        return input.not()
    }
    return !hasValue(input)
}

val Date = ProgrammingDate()
val Underscore = ProgrammingUnderscore()
val Math = ProgrammingMath()
val console = ProgrammingConsole()`;

export const render = (code: ProgrammingLanguage | undefined, tabs: string): unknown => {
	if(code === null) return "null";
	if(code === undefined) return "null";
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
		return `(${render(code.value, tabs)} ?: ${render(code.fallback, tabs)})`;
	}
	case "get": {
		const rest = code.variable.slice(1).map(it => render(it, tabs)).join(", ");
		// @ts-ignore
		const name = remap[code.variable[0]] ?? code.variable[0];
		return `get(
${tabs}\tlistOf(
${tabs}\t\t${
	typeof name === "string" ? name : render(name, `${tabs}\t\t`)
}${rest ? `,
${tabs}\t\t${rest}` : ""}
${tabs}\t)
${tabs})`;
	}
	case "set":
		return `${tabs}${code.variable.length <= 1 ? `${code.variable[0]} = ` : ""}set(
${tabs}\tlistOf(
${tabs}\t\t${code.variable[0]},
${tabs}\t\t${code.variable.slice(1).map(it => render(it, `${tabs}\t\t\t`)).join(`,\n${tabs}\t\t\t`)}
${tabs}\t),
${tabs}\t${render(code.value, `${tabs}\t`)}
${tabs})`;
	case "not":
		return `not(${render(code.item, tabs)})`;
	case "add":
		return "add(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "sub":
		return "sub(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "mult":
		return "mult(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "div":
		return "div(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "or":
		return code.items.slice(1).reduce(
			(bool, next) => `hasValue(${bool}).or(hasValue(${render(next, tabs)
			}))`, render(code.items[0], tabs));
	case "and":
		return code.items.slice(1).reduce(
			(bool, next) => `hasValue(${bool}).and(hasValue(${render(next, tabs)
			}))`, render(code.items[0], tabs));
	case "gt":
		return `gt(${render(code.a, tabs)}, ${render(code.b, tabs)})`;
	case "lt":
		return `lt(${render(code.a, tabs)}, ${render(code.b, tabs)})`;
	case "gte":
		return `gte(${render(code.a, tabs)}, ${render(code.b, tabs)})`;
	case "eq":
		return `(${render(code.a, tabs)} == ${render(code.b, tabs)})`;
	case "condition": {
		const otherwise = code.otherwise ? ` else {
${render(code.otherwise, tabs + "\t")}
${tabs}}` : "";
		return `${tabs}if(hasValue(${render(code.test, tabs)})) {
${render(code.then, tabs + "\t")}
${tabs}}${otherwise}`;
	}
	case "defined": {
		const value = render(code.item, tabs);
		return `(${value} !== null)`;
	}
	case "fun": {
		const body = [
			...code.args.map(it => `${tabs}\t\tval ${it} = get(listOf(args, "${it}"))`),
			render(code.body, `${tabs}\t\t`)
		];
		if(code.name) {
			return `extensions["${code.name}"] = object : Extension {
${tabs}override fun call(vararg list: Any?): Any? {
${tabs}\t${code.args.length ? "val args = list[1]" : ""}
${body.join("\n")}
${tabs}\t\treturn null
${tabs}\t}
${tabs}}`;
		}
		return `object : ArgumentCallback {
${tabs}\toverride fun call(args: Any?): Any? {
${body.join("\n")}
${tabs}\t\treturn null
${tabs}\t}
${tabs}}`;
	}
	case "invoke": {
		const target = render(code.target, `${tabs}\t`);
		const fun = code.fun;
		const args = code.args.map(it => render(it, `${tabs}\t\t`));
		const sideEffect = code.sideEffect;
		return `${sideEffect ? tabs : ""}invoke(
${tabs}\t${target},
${tabs}\t"${fun}",
${tabs}\tlistOf${args.length ? "" : "<Any>"}(
${tabs}\t\t${args.join(`,\n${tabs}\t\t`)}
${tabs}\t)
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
			return `mutableListOf<Any?>(${code.length ? content : ""})`;
		}
		if(typeof code === "object") {
			const keys = Object.keys(code);
			return keys.length ? `mutableMapOf<String, Any?>(
${tabs}\t${keys.map(key => `"${key}" to ${render(code[key], `${tabs}\t`)}`).join(`,\n\t${tabs}`)}
${tabs})` : "mutableMapOf<String, Any?>()";
		}
		if(typeof code === "number") {
			return `(${code}).toDouble()`;
		}
		return JSON.stringify(code);
	}
};
