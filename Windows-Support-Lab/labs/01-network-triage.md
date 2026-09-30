# Lab 1 — Network triage

## Scenario

A Windows user reports:

> “I have no internet.”

The goal is to avoid immediately guessing at Wi-Fi, DNS or the ISP. Work from the local machine outward and isolate the failing layer.

## Troubleshooting path

1. Confirm the adapter is present and enabled.
2. Inspect IP address, subnet, gateway and DNS configuration.
3. Test the local TCP/IP stack.
4. Test the default gateway.
5. Test a public IP address.
6. Test DNS resolution.
7. Compare the results and identify the most likely layer of failure.

## Commands to research and use

- `Get-NetIPConfiguration`
- `Get-NetAdapter`
- `Test-Connection`
- `Resolve-DnsName`
- `Test-NetConnection`
- `ipconfig /all`

## Exercise

Do not paste results containing private network information into a public repository.

Run the tests on a Windows machine and fill in this table in your private notes first:

| Test | Expected result | Actual result | What it proves |
| --- | --- | --- | --- |
| Adapter status | TODO | TODO | TODO |
| Loopback | TODO | TODO | TODO |
| Gateway | TODO | TODO | TODO |
| Public IP | TODO | TODO | TODO |
| DNS lookup | TODO | TODO | TODO |

## Questions to answer in your own words

- What is the difference between testing a public IP and resolving a hostname?
- If `1.1.1.1` is reachable but `example.com` does not resolve, what layer would you investigate?
- Why does a valid-looking IP address not necessarily prove internet access?
- What can an APIPA address (`169.254.x.x`) suggest?
- Why should a support technician collect evidence before resetting network settings?

## Completion criteria

This lab is complete when:
- the commands have been run on a real Windows machine,
- the learning log contains your own explanation of the results,
- the PowerShell starter script has been updated using what you learned.
