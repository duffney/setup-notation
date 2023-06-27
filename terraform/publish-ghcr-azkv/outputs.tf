output "akv_name" {
	value = azurerm_key_vault.kv.name
}

output "cert_name" {
	value = azurerm_key_vault_certificate.cert.name 
}
