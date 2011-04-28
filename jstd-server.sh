#!/bin/sh
mvn exec:java -Dexec.classpathScope=test -Dexec.mainClass=com.google.jstestdriver.JsTestDriver -Dexec.args="--port 42442 --runnerMode INFO"
