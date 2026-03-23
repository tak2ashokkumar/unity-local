export const SAMPLE_ANSIBLE_SCRIPT = () => `
--- # Favorite movies
- Casablanca
- North by Northwest
- The Man Who Wasn't There
--- # Shopping list
[milk, pumpkin pie, eggs, juice]
--- # Indented Blocks, common in YAML data files, use indentation and new lines to separate the key: value pairs
  name: John Smith
  age: 33
--- # Inline Blocks, common in YAML data streams, use commas to separate the key: value pairs between braces
{name: John Smith, age: 33}
---
receipt:     Oz-Ware Purchase Invoice
date:        2007-08-06
customer:
    given:   Dorothy
    family:  Gale

items:
    - part_no:   A4786
      descrip:   Water Bucket (Filled)
      price:     1.47
      quantity:  4

    - part_no:   E1628
      descrip:   High Heeled "Ruby" Slippers
      size:       8
      price:     100.27
      quantity:  1

bill-to:  &id001
    street: |
            123 Tornado Alley
            Suite 16
    city:   East Centerville
    state:  KS

ship-to:  *id001
parcel-to: *id001
specialDelivery:  >
    Follow the Yellow Brick
    Road to the Emerald City.
    Pay no attention to the
    man behind the curtain.
...
`;

export const SAMPLE_TERRAFORM_SCRIPT = () => `
variable "instance_type"  # Missing opening brace

resource "aws_instance" "web" {
  ami           == "ami-0c55b159cbfafe1f0"  # Invalid operator (== instead of =)
  instance_type "t2.micro"                 # Missing equal sign
  unknowntoken "value"                     # Unknown keyword
}

resource "aws_s3_bucket" "bucket" {        # Missing closing brace will trigger brace imbalance
  bucket = "my-bucket"
`;

export const SAMPLE_BASH_SCRIPT = () => `
#!/bin/bash

# clone the repository
git clone http://github.com/garden/tree

# generate HTTPS credentials
cd tree
openssl genrsa -aes256 -out https.key 1024
openssl req -new -nodes -key https.key -out https.csr
openssl x509 -req -days 365 -in https.csr -signkey https.key -out https.crt
cp https.key{,.orig}
openssl rsa -in https.key.orig -out https.key

# start the server in HTTPS mode
cd web
sudo node ../server.js 443 'yes' >> ../node.log &

exit 0
`;

export const SAMPLE_PYTHON_SCRIPT = () => `
# Literals
1234
0.0e101
.123
0b01010011100
0o01234567
0x0987654321abcdef
7
2147483647
3L
79228162514264337593543950336L
0x100000000L
79228162514264337593543950336
0xdeadbeef
3.14j
10.j
10j
.001j
1e100j
3.14e-10j


# String Literals
'For\''
"God\""
"""so loved
the world"""
'''that he gave
his only begotten\' '''
'that whosoever believeth \
in him'
''

# Identifiers
__a__
a.b
a.b.c

#Unicode identifiers on Python3
# a = x\ddot
a⃗ = ẍ
# a = v\dot
a⃗ = v̇

#F\vec = m \cdot a\vec
F⃗ = m•a⃗ 

# Operators
+ - * / % & | ^ ~ < >
== != <= >= <> << >> // **
and or not in is

#infix matrix multiplication operator (PEP 465)
A @ B

# Keywords
as assert break class continue def del elif else except
finally for from global if import lambda pass raise
return try while with yield

# Python 2 Keywords (otherwise Identifiers)
exec print

# Python 3 Keywords (otherwise Identifiers)
nonlocal

# Types
bool classmethod complex dict enumerate float frozenset int list object
property reversed set slice staticmethod str super tuple type

# Python 2 Types (otherwise Identifiers)
basestring buffer file long unicode xrange

# Python 3 Types (otherwise Identifiers)
bytearray bytes filter map memoryview open range zip

# Some Example code
import os
from package import ParentClass

@nonsenseDecorator
def doesNothing():
    pass

class ExampleClass(ParentClass):
    @staticmethod
    def example(inputStr):
        a = list(inputStr)
        a.reverse()
        return ''.join(a)

    def __init__(self, mixin = 'Hello'):
        self.mixin = mixin

# Python 3.6 f-strings (https://www.python.org/dev/peps/pep-0498/)
f'My name is {name}, my age next year is {age+1}, my anniversary is {anniversary:%A, %B %d, %Y}.'
f'He said his name is {name!r}.'
f"""He said his name is {name!r}."""
f'{"quoted string"}'
f'{{ {4*10} }}'
f'This is an error }'
f'This is ok }}'
fr'x={4*10}\n'
`;

export const SAMPLE_POWERSHELL_SCRIPT = () => `
# Paths
cd c:\
c:\windows\calc.exe

# Number Literals
0 12345
12kb 12mb 12gB 12Tb 12PB 12L 12D 12lkb 12dtb
1.234 1.234e56 1. 1.e2 .2 .2e34
1.2MB 1.kb .1dTb 1.e1gb
0x1 0xabcdef 0x3tb 0xelmb

@"
Multiline
string
"@
# --
@"
Multiline
string with quotes "'
"@
# --
@'

Multiline literal
string with quotes "'
'@

# Operators
= += -= *= /= %=
++ -- .. -f * / % + -
-not ! -bnot
-split -isplit -csplit
-join
-is -isnot -as
-eq -ieq -ceq -ne -ine -cne
-gt -igt -cgt -ge -ige -cge
-lt -ilt -clt -le -ile -cle
-like -ilike -clike -notlike -inotlike -cnotlike
-match -imatch -cmatch -notmatch -inotmatch -cnotmatch
-contains -icontains -ccontains -notcontains -inotcontains -cnotcontains
-replace -ireplace -creplace
-band	-bor -bxor
-and -or -xor

# Keywords
elseif begin function for foreach return else trap while do data dynamicparam
until end break if throw param continue finally in switch exit filter from try
process catch

# Built-in variables
$$ $? $^ $_
$args $ConfirmPreference $ConsoleFileName $DebugPreference $Error
$ErrorActionPreference $ErrorView $ExecutionContext $false $FormatEnumerationLimit
$HOME $Host $input $MaximumAliasCount $MaximumDriveCount $MaximumErrorCount
$MaximumFunctionCount $MaximumHistoryCount $MaximumVariableCount $MyInvocation
$NestedPromptLevel $null $OutputEncoding $PID $PROFILE $ProgressPreference
$PSBoundParameters $PSCommandPath $PSCulture $PSDefaultParameterValues
$PSEmailServer $PSHOME $PSScriptRoot $PSSessionApplicationName
$PSSessionConfigurationName $PSSessionOption $PSUICulture $PSVersionTable $PWD
$ShellId $StackTrace $true $VerbosePreference $WarningPreference $WhatIfPreference
$true $false $null

# Built-in functions
A:
Add-Computer Add-Content Add-History Add-Member Add-PSSnapin Add-Type
B:
C:
Checkpoint-Computer Clear-Content Clear-EventLog Clear-History Clear-Host Clear-Item
Clear-ItemProperty Clear-Variable Compare-Object Complete-Transaction Connect-PSSession
ConvertFrom-Csv ConvertFrom-Json ConvertFrom-SecureString ConvertFrom-StringData
Convert-Path ConvertTo-Csv ConvertTo-Html ConvertTo-Json ConvertTo-SecureString
ConvertTo-Xml Copy-Item Copy-ItemProperty
D:
Debug-Process Disable-ComputerRestore Disable-PSBreakpoint Disable-PSRemoting
Disable-PSSessionConfiguration Disconnect-PSSession
E:
Enable-ComputerRestore Enable-PSBreakpoint Enable-PSRemoting Enable-PSSessionConfiguration
Enter-PSSession Exit-PSSession Export-Alias Export-Clixml Export-Console Export-Counter
Export-Csv Export-FormatData Export-ModuleMember Export-PSSession
F:
ForEach-Object Format-Custom Format-List Format-Table Format-Wide
G:
Get-Acl Get-Alias Get-AuthenticodeSignature Get-ChildItem Get-Command Get-ComputerRestorePoint
Get-Content Get-ControlPanelItem Get-Counter Get-Credential Get-Culture Get-Date
Get-Event Get-EventLog Get-EventSubscriber Get-ExecutionPolicy Get-FormatData Get-Help
Get-History Get-Host Get-HotFix Get-Item Get-ItemProperty Get-Job Get-Location Get-Member
Get-Module Get-PfxCertificate Get-Process Get-PSBreakpoint Get-PSCallStack Get-PSDrive
Get-PSProvider Get-PSSession Get-PSSessionConfiguration Get-PSSnapin Get-Random Get-Service
Get-TraceSource Get-Transaction Get-TypeData Get-UICulture  Get-Unique Get-Variable Get-Verb
Get-WinEvent Get-WmiObject Group-Object
H:
help
I:
Import-Alias Import-Clixml Import-Counter Import-Csv Import-LocalizedData Import-Module
Import-PSSession ImportSystemModules Invoke-Command Invoke-Expression Invoke-History
Invoke-Item Invoke-RestMethod Invoke-WebRequest Invoke-WmiMethod
J:
Join-Path
K:
L:
Limit-EventLog
M:
Measure-Command Measure-Object mkdir more Move-Item Move-ItemProperty
N:
New-Alias New-Event New-EventLog New-Item New-ItemProperty New-Module New-ModuleManifest
New-Object New-PSDrive New-PSSession New-PSSessionConfigurationFile New-PSSessionOption
New-PSTransportOption New-Service New-TimeSpan New-Variable New-WebServiceProxy
New-WinEvent
O:
oss Out-Default Out-File Out-GridView Out-Host Out-Null Out-Printer Out-String
P:
Pause Pop-Location prompt Push-Location
Q:
R:
Read-Host Receive-Job Receive-PSSession Register-EngineEvent Register-ObjectEvent
Register-PSSessionConfiguration Register-WmiEvent Remove-Computer Remove-Event
Remove-EventLog Remove-Item Remove-ItemProperty Remove-Job Remove-Module
Remove-PSBreakpoint Remove-PSDrive Remove-PSSession Remove-PSSnapin Remove-TypeData
Remove-Variable Remove-WmiObject Rename-Computer Rename-Item Rename-ItemProperty
Reset-ComputerMachinePassword Resolve-Path Restart-Computer Restart-Service
Restore-Computer Resume-Job Resume-Service
S:
Save-Help Select-Object Select-String Select-Xml Send-MailMessage Set-Acl Set-Alias
Set-AuthenticodeSignature Set-Content Set-Date Set-ExecutionPolicy Set-Item
Set-ItemProperty Set-Location Set-PSBreakpoint Set-PSDebug
Set-PSSessionConfiguration Set-Service Set-StrictMode Set-TraceSource Set-Variable
Set-WmiInstance Show-Command Show-ControlPanelItem Show-EventLog Sort-Object
Split-Path Start-Job Start-Process Start-Service Start-Sleep Start-Transaction
Start-Transcript Stop-Computer Stop-Job Stop-Process Stop-Service Stop-Transcript
Suspend-Job Suspend-Service
T:
TabExpansion2 Tee-Object Test-ComputerSecureChannel Test-Connection
Test-ModuleManifest Test-Path Test-PSSessionConfigurationFile Trace-Command
U:
Unblock-File Undo-Transaction Unregister-Event Unregister-PSSessionConfiguration
Update-FormatData Update-Help Update-List Update-TypeData Use-Transaction
V:
W:
Wait-Event Wait-Job Wait-Process Where-Object Write-Debug Write-Error Write-EventLog
Write-Host Write-Output Write-Progress Write-Verbose Write-Warning
X:
Y:
Z:
`;

export const GET_SAMPLE_SCRIPTS = (scriptType: string) => {
    switch (scriptType) {
        case 'ansible': return SAMPLE_ANSIBLE_SCRIPT();
        case 'terraform': return SAMPLE_TERRAFORM_SCRIPT();
        case 'bash': return SAMPLE_BASH_SCRIPT();
        case 'python': return SAMPLE_PYTHON_SCRIPT();
        case 'powershell': return SAMPLE_POWERSHELL_SCRIPT();
        default: console.error('Invalid scriptType type : ', scriptType);
    }
}