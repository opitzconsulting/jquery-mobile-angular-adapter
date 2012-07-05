#!/bin/sh
mvn exec:java -Dexec.classpathScope=test -Dexec.mainClass=com.google.jstestdriver.Main -Dexec.args="--config jstd-unit.conf --reset --tests all"
