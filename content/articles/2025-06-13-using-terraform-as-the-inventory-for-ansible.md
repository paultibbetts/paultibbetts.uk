+++
date = '2025-06-13T11:30:21+01:00'
archive = ['2025']
title = 'Using Terraform as the Inventory for Ansible'
tags = ['Ansible', 'Terraform']
+++

Terraform and Ansible are complementary tools with which you can do Infrastructure as Code. You would use [Terraform](https://www.terraform.io/) to request machines from providers and then [Ansible](https://docs.ansible.com/ansible/latest/index.html) to configure them.

Using both of them together, with a dynamic inventory to link them, has been technically possible for years but never obvious enough for me to work out.

Until I found the Terraform provider.

<!--more-->

## Ansible provider for Terraform

By using the [Ansible provider](https://registry.terraform.io/providers/ansible/ansible/latest) you can teach Terraform what an Ansible inventory entry would look like next to the rest of its code. 

You start by defining the provider:

```terraform
terraform {
  required_providers {
    ansible = {
      source  = "ansible/ansible"
      version = "1.3.0"
    }
  }
}
```

and then you can define the Ansible inventory entry right next to the resource:

```terraform
resource "proxmox_vm_qemu" "gitea" {
  cores = 1
	...
}

resource "ansible_host" "gitea" {
  name   = proxmox_vm_qemu.gitea.ssh_host
  groups = ["gitea"]
  variables = {
    ansible_user = "ansible"
  }
}
```

which means you don't need to hardcode IP addresses anywhere.

You would need to `terraform apply` this plan so that Terraform adds these resources to the state file so that Ansible can use them.

## Terraform plugin for Ansible

On the Ansible side you use [a plugin](https://github.com/ansible-collections/cloud.terraform) to tell it how to use Terraform as its inventory.

Add the following to your `requirements.yaml` file:

```yaml
collections:
  - name: cloud.terraform
    version: 1.1.0
```

and then install the collection using `ansible-galaxy collection install -r requirements.yaml`,

then create an `inventory.yaml` with the following content:

```yaml
plugin: cloud.terraform.terraform_provider
# project_path: ../terraform # if your Terraform code is in a different directory
# state_file: mycustomstate.tfstate # if you wanted to define which state file
```

and set it as the default inventory in `ansible.cfg`:

```ini
[defaults]
inventory = inventory.yaml
```

You can confirm the plugin works by doing:

```sh
ansible-inventory --graph
```

which should return something like the following:

```sh
@all:
  |--@ungrouped:
  |--@gitea:
  |  |--192.168.1.211
```

## 🎉

What's good about this is now you can be hands-off with IP addresses. 

Terraform can request a new machine, wait for it to receive an IP address and then make it available for Ansible to use, without you needing to do anything.

### Remote state

The Ansible plugin will default to using whichever backend you use for the Terraform state file, whether that's local or in an S3-compatible location.

This means Ansible is always running against the current infrastructure, which helps when colleagues and automations are updating things a ~~hundred~~ thousand times a day.

## In Conclusion

Using Terraform and Ansible together can cover all aspects of Infrastructure as Code. 

The Ansible provider lets you keep all your resource code together in Terraform and then makes it available to Ansible, which uses a plugin to let it use the state file as its inventory.
