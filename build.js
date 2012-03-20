var fs  = require("fs");
var carrier = require('carrier');

function readVersion() {
    var pom = fs.readFileSync('pom.xml', 'utf-8');
    return /<version>(.*)<\/version>/.exec(pom)[1];
}

var versionPlaceholder = "${project.version}";
var includeRegex = /<jsp:include page="(.*)"\/>/;

function parseFile(version) {
    var input = fs.createReadStream('src/main/webapp/jqm-angular.jsp');
    var out = fs.createWriteStream('compiled/jquery-mobile-angular-adapter-'+version+'.js');
    carrier.carry(input, function(line) {
        line = line.replace(versionPlaceholder, version);
        var match = includeRegex.exec(line);
        if (match) {
            var fileName = match[1];
            line = fs.readFileSync("src/main/webapp/"+fileName,'utf-8');
        }
        out.write(line+'\n');
    });
}

parseFile(readVersion());