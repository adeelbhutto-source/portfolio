<#
.SYNOPSIS
Starter for basic layered network tests.

.DESCRIPTION
The point of this script is to understand what each test proves.
Do not add automatic "fix everything" actions. Diagnose first.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-LocalNetwork {
    # TODO:
    # 1. Inspect current IP configuration.
    # 2. Identify the default gateway.
    # 3. Test gateway reachability.
    # 4. Test a public IP address.
    # 5. Test DNS resolution.
    #
    # Return structured results so each layer can be evaluated separately.
    throw "TODO: implement Test-LocalNetwork"
}

function Explain-NetworkResult {
    param(
        [Parameter(Mandatory)]
        [object]$Result
    )

    # TODO:
    # Translate test results into a short explanation such as:
    # - local configuration problem
    # - gateway/LAN problem
    # - upstream connectivity problem
    # - likely DNS problem
    throw "TODO: implement Explain-NetworkResult"
}
