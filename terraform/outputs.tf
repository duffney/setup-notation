output "akv_name" {
	value = azurerm_key_vault.kv.name
}

output "acr_name" {
	value = azurerm_container_registry.registry.name
}

output "cert_name" {
	value = azurerm_key_vault_certificate.cert.name 
}
