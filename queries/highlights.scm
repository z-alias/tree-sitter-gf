[
 "abstract"
 "resource"
 "interface"
 "concrete"
 "instance"
 "open"
] @include

(compl_mod) @include

[ 
  "of"
  "let"
  "in"
  "where"
  "data"
  "table"
  "variants"
  "pre"
  "strs"
] @keyword

[
 "{"
 "}"
 "["
 "]"
 "("
 ")"
 "<"
 ">"
] @punctuation.bracket

[
 "_"
] @variable

[
 "."
 ":"
 ";"
 ","
 "->"
 "=>"
 "++"
 "*"
 "**"
 "!"
 "@"
 "-"
 "|"
 "+"
 "="
 "$"
 "/"
 "?"
 "\\"
 "\\\\"
] @operator

[
 "case"
] @conditional

[
 "cat"
 "fun"
 "def"
 "data"
 "param"
 "oper"
 "lincat"
 "lindef"
 "linref"
 "lin"
 "printname"
 "flags"
] @structure

(comment) @comment

(module_name (ident) @namespace)

(term_e_int) @number
(term_k) @string

(loc_def
  name: (_)
  type: (_) @type
  value: (_))

(loc_def
  name: (_)
  type: (term_vr) @type)

(loc_def
  name: (_)
  type: (term_p (_) (_) @type))

(term_prod (decl (_)? (term_vr) @type) (_))
(term_prod (decl (_)? (term_p (_) (_) @type)) (_))

(term_prod (_) (term_vr) @type)
(term_prod (_) (term_p (_) (_) @type))

(term_sort) @type

(term_app (term_vr) @function.call (_))
(term_app (term_p (_) (_) @function.call) (_))

(list_ident (ident) @function)
(lhs_name (lhs_ident) @function)

(term_p (term_vr) @namespace (_))


