<#
.SYNOPSIS
Starter for a small Windows support snapshot.

.DESCRIPTION
This file intentionally contains TODOs. Complete them while working through
the support lab rather than treating this as finished portfolio code.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-BasicSystemInfo {
    # TODO:
    # Return a small object containing:
    # - computer name
    # - Windows edition/version
    # - last boot time or uptime
    throw "TODO: implement Get-BasicSystemInfo"
}

function Get-NetworkSummary {
    # TODO:
    # Use PowerShell networking cmdlets to return active adapter information.
    # Avoid printing secrets or unrelated personal information.
    throw "TODO: implement Get-NetworkSummary"
}

function Get-ServiceSummary {
    param(
        [string[]]$ServiceNames = @("Dnscache", "Dhcp")
    )

    # TODO:
    # Return Name, Status and StartType for requested services.
    throw "TODO: implement Get-ServiceSummary"
}

# TODO:
# Combine the functions into one readable support snapshot.
# Prefer structured objects over one giant formatted string.
