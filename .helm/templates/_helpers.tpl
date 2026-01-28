{{- define "rancher.selector" -}}
deployment-{{ .Values.namespacePrefix }}-{{ .Values.environment }}-{{ .Values.appName }}-{{ .Values.environment }}
{{- end }}

{{- define "app.fullname" -}}
{{ .Release.Name }}
{{- end }}
