" Vim syntax file
" Language:     Moringa Script
" Maintainer:   Moringa Team
" Last Change:  2024
" Filenames:    *.pgm, *.moringa

if exists("b:current_syntax")
  finish
endif

" Keywords
syn keyword moringaDirective context recognizer sequence memories conjugate synonym
syn keyword moringaAction say remember recall forget expect enter exit do interpret imagine unimagine seek avoid
syn keyword moringaConditional always option open fallback nonexclusive
syn keyword moringaKeyword if and or not as in at to from on with by for of the a an
syn keyword moringaKeyword is are am was were be been being have has had do does did
syn keyword moringaKeyword will would could should may might can
syn keyword moringaTimeUnit seconds minutes hours days weeks months years second minute hour day week month year
syn keyword moringaTimeMeridiem AM PM

" Comments
syn match moringaComment "--.*$"

" Strings
syn region moringaString start='"' end='"' contains=moringaVariable,moringaEscape
syn match moringaEscape "\\." contained

" Variables
syn match moringaVariable "\[\w\+\(:\w\+\(,\w\+\)*\)\?\]" contained
syn match moringaVariable "\[\w\+\(:\w\+\(,\w\+\)*\)\?\]"

" Numbers
syn match moringaNumber "\<\d\+\(\.\d\+\)\?\>"

" Time patterns
syn match moringaTime "\<\d\{1,2\}:\d\{2\}\(:\d\{2\}\)\?\>"

" Operators
syn match moringaOperator "[%:]"
syn match moringaSeparator "[,()]"

" Define the default highlighting
hi def link moringaDirective     Statement
hi def link moringaAction        Function
hi def link moringaConditional   Conditional
hi def link moringaKeyword       Keyword
hi def link moringaTimeUnit      Keyword
hi def link moringaTimeMeridiem  Keyword
hi def link moringaComment       Comment
hi def link moringaString        String
hi def link moringaVariable      Identifier
hi def link moringaEscape        SpecialChar
hi def link moringaNumber        Number
hi def link moringaTime          Number
hi def link moringaOperator      Operator
hi def link moringaSeparator     Delimiter

" Set the syntax name
let b:current_syntax = "moringa"

" Folding
syn region moringaFold start="^\s*\(context\|sequence\|recognizer\)" end="^$" fold transparent

" Enable folding
setlocal foldmethod=syntax
setlocal foldlevel=1

" Indentation
setlocal autoindent
setlocal smartindent
setlocal shiftwidth=4
setlocal tabstop=4
setlocal expandtab

" Comment strings for commentary plugins
setlocal commentstring=--\ %s