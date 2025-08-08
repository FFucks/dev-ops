{{- define "myapp.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "myapp.fullname" -}}
{{- printf "%s-%s" .Chart.Name .Release.Name -}}
{{- end -}}
