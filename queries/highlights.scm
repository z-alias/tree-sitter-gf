[
 "abstract"
 "resource"
 "interface"
 "concrete"
 "instance"
] @include

(compl_mod) @include

[ 
  "of"
] @keyword

[
 "."
 ":"
 ";"
 ","
] @operator

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

(exp_e_int) @number
(exp_k) @string

(exp_sort) @type

(term_app (exp_vr) @function.call (_))


