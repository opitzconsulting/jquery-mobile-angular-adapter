define(function() {
        var data = {};

        var get;
        if (typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node) {
            //Using special require.nodeRequire, something added by r.js.
            fs = require.nodeRequire('fs');

            get = function (url, callback) {
                callback(fs.readFileSync(url, 'utf8'));
            };
        } else if (typeof Packages !== 'undefined') {
            //Why Java, why is this so awkward?
            get = function (url, callback) {
                var encoding = "utf-8",
                    file = new java.io.File(url),
                    lineSeparator = java.lang.System.getProperty("line.separator"),
                    input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                    stringBuffer, line,
                    content = '';
                try {
                    stringBuffer = new java.lang.StringBuffer();
                    line = input.readLine();

                    // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                    // http://www.unicode.org/faq/utf_bom.html

                    // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                    // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                    if (line && line.length() && line.charAt(0) === 0xfeff) {
                        // Eat the BOM, since we've already found the encoding on this file,
                        // and we plan to concatenating this buffer with others; the BOM should
                        // only appear at the top of a file.
                        line = line.substring(1);
                    }

                    stringBuffer.append(line);

                    while ((line = input.readLine()) !== null) {
                        stringBuffer.append(lineSeparator);
                        stringBuffer.append(line);
                    }
                    //Make sure we return a JavaScript string and not a Java string.
                    content = String(stringBuffer.toString()); //String
                } finally {
                    input.close();
                }
                callback(content);
            };
        }

        function escapeCss(text) {
            return text.replace(/(['])/g, '\\$1');
        }

        function load(name, req, load, config) {
            if (typeof window !== "undefined") {
                window.$("head").append('<link rel="stylesheet" href="' + name + '.css"/>');
                load('');
            } else {
                var url = req.toUrl(name)+".css";
                get(url, function(content) {
                    data[name] = content;
                    load('');
                });
            }
        }

        function write(pluginName, moduleName, write) {
            var text = data[moduleName];
            text = escapeCss(text);
            write("$('head').append('<style type=\"text/css\">"+text+"</style>');\n");
        }

        return {
            load: load,
            write: write
        };
    }
)
    ;