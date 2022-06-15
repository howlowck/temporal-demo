terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }
  backend "azurerm" {
  }
}



# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "core" {
  name     = "rg-${var.product}-${var.environment}"
  location = var.location
}

resource "azurerm_kubernetes_cluster" "core" {
  name                = "aks-${var.product}-${var.environment}"
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
  dns_prefix          = "aks${var.product}${var.environment}"

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_B2s" # x3 = ~$100
  }

  identity {
    type = "SystemAssigned"
  }
}