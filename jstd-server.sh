#!/bin/sh
mvn exec:java -Dexec.classpathScope=test -Dexec.mainClass=com.google.jstestdriver.JsTestDriver -Dexec.args="--port 9876 --runnerMode INFO"
