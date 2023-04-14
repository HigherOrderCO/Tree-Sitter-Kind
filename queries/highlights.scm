(f60_literal) @number
(u60_literal) @number
(u120_literal) @number
(n_literal) @number
(string) @string
(char) @string

(line_comment) @comment

[
  "."
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

[
  "if"
  "do"
  "return"
  "specialize"
  "into"
  "in"
  "with"
  "match"
  "type"
  "record"
  "else"
  "let"
  "open"
  "ask"
] @keyword

[
  "@"
  "$"
  "+"
  "-"
  "*"
  "/"
  "%"
  "^"
  "&"
  "|"
  "&&"
  "||"
  "!"
  "~"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "<<"
  ">>"
  "="
  "::"
] @operator

(attribute) @attribute

((constructor_identifier
  (upper_id) @function.method
  (dot_access
    (lower_id) @constant.builtin))
  (#match? @constant.builtin "^(true|false)$"))

(member_signature
  name: (identifier) @property)

(member_signature
  name: (constructor_identifier) @property)

(field_signature
  name: (identifier) @property)

(field_signature
  name: (constructor_identifier) @property)

(implicit_parameter
  name: (identifier) @label)

(implicit_parameter
  name: (constructor_identifier) @label)

(explicit_parameter
  name: (identifier) @variable.parameter)

(explicit_parameter
  name: (constructor_identifier) @variable.parameter)

(lam_expr
  (lam_parameter
    (identifier)) @variable.parameter)

(pattern
  (identifier) @variable.parameter)

((identifier) @type.builtin
  (#match? @type.builtin "^(Type|Bool|Pair|Sigma|U60|U120|F60|String)$"))

((upper_id) @variable.builtin
  (#match? @variable.builtin "^(Type|Bool|Pair|Sigma|U60|U120|F60|String)$"))

(upper_id) @function.method

(identifier) @variable