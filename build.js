var fs  = require("fs");
var uglify = require('uglify-js');
var encoding = "utf-8";

var pjson = require('./package.json');

function readVersion() {
    return pjson.version;
}

var versionPlaceholder = "${project.version}";
var includeRegex = /<jsp:include page="(.*)"\/>/g;

function compress(instring, outfile) {
    var  jsp = uglify.parser,
        pro = uglify.uglify;
    var ast = jsp.parse(instring);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    return pro.gen_code(ast);
}

function build(inputName, outputName, version) {
    var input = fs.readFileSync(inputName, encoding);
    input = input.replace(versionPlaceholder, version);
    input = input.replace(includeRegex, function(data, fileName) {
        return fs.readFileSync("src/main/webapp/"+fileName,encoding);
    });

    fs.writeFileSync('compiled/'+outputName+'-'+version+'.js', input, encoding);
    fs.writeFileSync('compiled/min/'+outputName+'-'+version+'.js', compress(input), encoding);
}


var v = readVersion();
build('src/main/webapp/jqm-angular.jsp', 'jquery-mobile-angular-adapter', v);
build('src/main/webapp/jqm-angular-standalone.jsp', 'jquery-mobile-angular-adapter-standalone', v);
