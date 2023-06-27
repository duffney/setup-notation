variable "kv_name" {
  type = string
}

variable "rg_name" {
  type = string
}

variable "location" {
  type = string
  default = "eastus"
}

variable "tags" {
  type = map(string)
}

variable "cert_name" {
  type = string
}
