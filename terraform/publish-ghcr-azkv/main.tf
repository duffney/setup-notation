terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.52.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.28.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

resource "random_id" "main" {
  byte_length = 4
}

data "azurerm_client_config" "current" {}

data "azuread_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = "${var.rg_name}${random_id.main.hex}"
  location = var.location
}

resource "azurerm_key_vault" "kv" {
  name                = "${var.kv_name}${random_id.main.hex}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
  tags                = var.tags

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azuread_client_config.current.object_id

    key_permissions = [
      "Get", "Sign"
    ]

    secret_permissions = [
      "Get", "Set", "List", "Delete", "Purge"
    ]

    certificate_permissions = [
      "Get", "Create", "Delete", "Purge"
    ]
  }
}

resource "azurerm_key_vault_certificate" "cert" {
  name         = var.cert_name
  key_vault_id = azurerm_key_vault.kv.id

  certificate_policy {
    issuer_parameters {
      name = "Self"
    }

    key_properties {
      exportable = false 
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = true
    }

    lifetime_action {
      action {
        action_type = "AutoRenew"
      }

      trigger {
        days_before_expiry = 30
      }
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }

    x509_certificate_properties {
      extended_key_usage = ["1.3.6.1.5.5.7.3.3"]

      key_usage = [
        "digitalSignature",
      ]

      subject            = "CN=example.com"
      validity_in_months = 12
    }
  }
}
