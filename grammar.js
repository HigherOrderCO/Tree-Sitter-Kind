module.exports = grammar({
  name: 'kind',
  rules: {
    source_file: $ => $.val_declaration,

    _declaration: $ => choice(
      $.val_declaration,
    ),

    val_declaration: $ => seq(
      field('name', $._name),
      field('parameters', repeat($.parameter)),
      optional(seq(
        ':',
        field('return_type', $._expression),
      )),
      optional(field('value', $.statements)),
    ),

    parameter: $ => seq(
      '(',
      field('name', $._name),
      ':',
      field('type', $._expression),
      ')',
    ),

    _expression: $ => choice(
      // $.do_expr,
      $.ask_expr,
      $.open_expr,
      $.return_expr,
      $.let_expr,
      $.if_expr,
      $.call,
    ),

    return_expr: $ => seq('return', field('value', $._expression)),

    statements: $ => prec.left(seq(
      '{',
      optional(seq(
        $._expression,
        repeat(seq($._line_break, $._expression)),
        optional($._line_break),
      )),
      '}'
    )),

    ask_expr: $ => seq(
      'ask',
      field('name', $._name),
      '=',
      field('value', $._expression),
    ),

    do_expr: $ => seq(
      'do',
      field('scrutinee', $._name),
      field('statements', $.statements),
    ),

    open_expr: $ => prec.left(seq(
      'open',
      field('name', $.constructor_identifier),
      field('value', $.identifier),
      optional(seq(
        $._line_break,
        field('next', $._expression),
      )),
    )),

    let_expr: $ => prec.left(seq(
      'let',
      field('name', $._name),
      '=',
      field('value', $._expression),
      optional(seq(
        $._line_break,
        field('next', $._expression),
      )),
    )),

    if_expr: $ => seq(
      'if',
      field('condition', $._expression),
      '{',
      field('then_branch', $._expression),
      '}',
      'else',
      '{',
      field('else_branch', $._expression),
      '}',
    ),

    call: $ => prec.right(seq(
      field('callee', $._primary),
      field('arguments', repeat($._primary)),
    )),

    group: $ => seq('(', $._expression, ')'),

    _name: $ => choice($.identifier, $.constructor_identifier),

    _primary: $ => choice(
      $.char,
      $.string,
      $.group,
      $.symbol_id,
      $.identifier,
      $.constructor_identifier,
      $._number_literal,
    ),

    identifier: $ => prec.left(seq(
      $.lower_id,
      repeat(choice($.dot_access, $.bar_access)),
    )),
    constructor_identifier: $ => prec.left(seq(
      $.upper_id,
      repeat(choice($.dot_access, $.bar_access)),
    )),

    _number_literal: $ => choice($.f60_literal, $.u60_literal, $.u120_literal, $.n_literal),

    _integer_literal: $ => choice($.decimal_number, $.octal, $.hex, $.binary),

    f60_literal: $ => prec(4, seq($._float_number, optional('f60'))),
    u60_literal: $ => prec(3, seq($._integer_literal, optional('u60'))),
    u120_literal: $ => prec(2, seq($._integer_literal, optional('u120'))),
    n_literal: $ => prec(1, seq($._integer_literal, optional('n'))),

    octal: $ => seq('0', choice('O', 'o'), $.octal_number),
    hex: $ => seq('0', choice('X', 'x'), $.hex_number),
    binary: $ => seq('0', choice('B', 'b'), $.binary_number),

    dot_access: $ => seq('.', $._any_id),
    bar_access: $ => seq('/', $._any_id),

    _any_id: $ => choice($.symbol_id, $.upper_id, $.lower_id),

    // LEXER
    _line_break: $ => /(\n|\r\n|;)+/,
    _ws: $ => /\s+/,

    symbol_id: $ => choice('$', '+', '-', '*', '/', '%', '^', '&', '|', '&&', '||', '!', '~', '==', '!=', '<', '>', '<=', '>=', '<<', '>>'),

    octal_number: $ => /[0-7]+/i,
    hex_number: $ => /[0-8a-fA-F]+/i,
    binary_number: $ => /[0-1]+/i,
    decimal_number: $ => /[0-9]+/i,
    _float_number: $ => /[\d_]+(\.[\d_]+)?/,

    char: $ => /'[^'\\]'/,
    string: $ => /"([^"\\\n\r]|\\[^\n\r])*"/,

    upper_id: $ => /[A-Z][a-zA-Z\d_$]*/,
    lower_id: $ => /[a-z][a-zA-Z\d_$]*/,
  },
});
