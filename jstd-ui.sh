#!/bin/sh
mvn exec:java -Dexec.classpathScope=test -Dexec.mainClass=com.google.jstestdriver.JsTestDriver -Dexec.args="--config jstd-ui.conf --reset --tests all"
