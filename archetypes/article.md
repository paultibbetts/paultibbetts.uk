+++
date = '{{ .Date }}'
draft = true
title = '{{ replace (replaceRE `^\d{4}-\d{2}-\d{2}-` "" .File.ContentBaseName) "-" " " | title }}'
tags = []
+++
