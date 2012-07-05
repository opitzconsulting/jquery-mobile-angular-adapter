#!/bin/sh
mvn exec:java -Dexec.classpathScope=test -Dexec.mainClass=com.google.jstestdriver.Main -Dexec.args="--config jstd-ui.conf --reset --tests all"
