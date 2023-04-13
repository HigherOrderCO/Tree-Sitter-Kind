// noinspection JSUnusedLocalSymbols

module.exports = grammar({
  name: 'kind',
  extras: $ => [
    $.doc_string,
    $.line_comment,
    /[\s\r\n\uFEFF\u2060\u200B]/,
  ],
  rules: {
    source_file: $ => seq(
      optional($.hash_bang_line),
      optional(seq(
        $._declaration,
        repeat(seq($._line_break, $._declaration)),
        optional($._line_break),
      )),
    ),

    _declaration: $ => choice(
      prec(6, $.attribute),
      prec(5, $.record_declaration),
      prec(4, $.type_declaration),
      prec(3, $.use_declaration),
      prec(2, $.rule_declaration),
      prec(1, $.val_declaration),
    ),

    attribute: $ => seq(
      field('name', $.attribute_id),
      optional(field('value', choice($.attribute_assign, $.attribute_apply))),
    ),

    attribute_assign: $ => seq('=', field('value', $._name)),

    attribute_apply: $ => seq(
      '[',
      optional(seq(
        $._name,
        repeat(seq(',', $._name)),
        optional(','),
      )),
      ']',
    ),

    record_declaration: $ => seq(
      'record',
      field('name', $._name),
      field('parameters', repeat($.parameter)),
      optional(seq(
        '~',
        field('indices', repeat($.parameter)),
      )),
      field('members', $.record_members),
    ),

    type_declaration: $ => seq(
      'type',
      field('name', $._name),
      field('parameters', repeat($.parameter)),
      optional(seq(
        '~',
        field('indices', repeat($.parameter)),
      )),
      field('members', $.type_members),
    ),

    record_members: $ => seq(
      '{',
      optional(repeat($.field_signature)),
      '}',
    ),

    type_members: $ => seq(
      '{',
      optional(repeat($.member_signature)),
      '}',
    ),

    field_signature: $ => prec.right(seq(
      field('name', $._name),
      ':',
      field('return_type', $._expression),
      $._decl_line_break_strict,
    )),

    member_signature: $ => seq(
      repeat($.attribute),
      field('name', $._name),
      field('parameters', repeat($.parameter)),
      optional(seq(
        ':',
        field('return_type', $._expression),
      )),
      $._decl_line_break_strict,
    ),

    use_declaration: $ => seq(
      'use',
      field('path', $._name),
      'as',
      field('alias', $._name),
    ),

    val_declaration: $ => prec.right(seq(
      field('name', $._name),
      field('parameters', repeat($.parameter)),
      ':',
      field('return_type', $._expression),
      optional(field('value', $.statements)),
    )),

    rule_declaration: $ => prec.left(seq(
      field('name', $._name),
      field('patterns', repeat($.pattern)),
      '=',
      field('value', $._expression),
    )),

    pattern: $ => choice(
      alias($.constructor_identifier, 'name_constructor_pattern'),
      alias($.identifier, 'identifier_pattern'),
      alias($.symbol_id, 'symbol_pattern'),
      $.char,
      $._number_literal,
      $.constructor_pattern,
    ),

    constructor_pattern: $ => prec(3, seq(
      '(',
      field('name', $.constructor_identifier),
      field('patterns', repeat($.pattern)),
      ')',
    )),

    parameter_modifier: $ => prec(3, choice('+', '-', '+-', '-+')),

    parameter: $ => seq(
      field('modifier', optional($.parameter_modifier)),
      choice($.implicit_parameter, $.explicit_parameter),
    ),

    implicit_parameter: $ => prec(2, seq(
      prec(5, '<'),
      field('name', $._name),
      optional(seq(
        ':',
        field('type', $._expression),
      )),
      prec(5, '>'),
    )),

    explicit_parameter: $ => prec(2, seq(
      '(',
      field('name', $._name),
      optional(seq(
        ':',
        field('type', $._expression),
      )),
      ')',
    )),

    _expression: $ => choice(
      $.match_expr,
      $.do_expr,
      $.ask_expr,
      $.open_expr,
      $.return_expr,
      $.let_expr,
      $.if_expr,
      $.sigma_type,
      prec(4, $.ann_expr),
      prec(3, $.lam_type),
      prec(2, $.lam_expr),
      prec(1, $.call),
    ),

    ann_expr: $ => prec.right(seq(
      field('value', $.call),
      repeat(seq(
        '::',
        field('type', $._expression),
      )),
    )),

    lam_type_parameter: $ => choice(
      $.lam_named_type_parameter,
      $.call,
    ),

    lam_named_type_parameter: $ => prec.left(4, seq(
      '(',
      field('name', $._name),
      ':',
      field('type', $._expression),
      ')',
    )),

    lam_type: $ => prec.right(seq(
      field('parameter', $.lam_type_parameter),
      repeat(seq(
        '->',
        field('return_type', $._expression),
      )),
    )),

    lam_expr: $ => prec.right(seq(
      field('parameter', $.lam_parameter),
      repeat(seq(
        '=>',
        field('return_type', $._expression),
      )),
    )),

    sigma_type: $ => prec.right(seq(
      '[',
      field('name', $._name),
      ':',
      field('parameter', $.lam_type_parameter),
      ']',
      '->',
      field('return_type', $._expression),
    )),

    lam_parameter: $ => choice(
      $._name,
      $.explicit_parameter,
    ),

    return_expr: $ => prec.right(seq('return', field('value', $._expression))),

    statements: $ => prec.right(seq(
      '{',
      optional(seq(
        $._expression,
        repeat(seq($._line_break, $._expression)),
        optional($._line_break),
      )),
      '}'
    )),

    ask_expr: $ => prec.right(seq(
      'ask',
      field('name', $._name),
      '=',
      field('value', $._expression),
    )),

    match_expr: $ => prec.right(seq(
      'match',
      field('scrutinee', $._name),
      field('name', $._name),
      optional(seq(
        '=',
        field('value', $._expression),
      )),
      field('branches', $.branches),
    )),

    branches: $ => prec.right(seq(
      '{',
      optional(seq(
        $.case,
        repeat(seq($._line_break, $.case)),
        optional($._line_break),
      )),
      '}'
    )),

    rename_pattern: $ => seq(
      '(',
      field('alias', $._name),
      '@',
      field('field', $._name),
      ')'
    ),

    constructor_match_pattern: $ => prec.right(seq(
      field('constructor', $._name),
      field('patterns', repeat($.match_pattern)),
    )),

    match_pattern: $ => choice(
      $.constructor_match_pattern,
      $.rename_pattern,
    ),

    case: $ => prec.right(seq(
      field('pattern', $.match_pattern),
      '=>',
      field('value', $._expression),
    )),

    do_expr: $ => seq(
      'do',
      field('scrutinee', $._name),
      field('statements', $.statements),
    ),

    open_expr: $ => prec.right(seq(
      'open',
      field('name', $.constructor_identifier),
      field('value', $.identifier),
      optional(seq(
        $._line_break,
        field('next', $._expression),
      )),
    )),

    let_expr: $ => prec.right(seq(
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

    call: $ => prec.left(seq(
      field('callee', $._primary),
      field('arguments', repeat($._primary)),
    )),

    group: $ => prec(1, seq('(', $._expression, ')')),

    _name: $ => prec(2, choice($.identifier, $.constructor_identifier)),

    _primary: $ => choice(
      $.help,
      $.char,
      $.string,
      $.op,
      $.group,
      $.identifier,
      $.constructor_identifier,
      $._number_literal,
    ),

    help: $ => prec.right(2, seq('?', optional($._name))),

    op: $ => prec(2, seq('(', $.symbol_id, repeat($._expression), ')')),

    identifier: $ => prec.right(seq(
      $.lower_id,
      repeat(choice($.dot_access, $.bar_access)),
    )),
    constructor_identifier: $ => prec.right(seq(
      $.upper_id,
      repeat(choice($.dot_access, $.bar_access)),
    )),

    _number_literal: $ => choice($.f60_literal, $.u60_literal, $.u120_literal, $.n_literal),

    _integer_literal: $ => choice($.decimal_number, $.octal, $.hex, $.binary),

    f60_literal: $ => prec(4, seq($._float_number, optional('f60'))),
    u60_literal: $ => prec(3, seq($._integer_literal, optional('u60'))),
    u120_literal: $ => prec(2, seq($._integer_literal, optional('u120'))),
    n_literal: $ => prec(1, seq($._integer_literal, optional('n'))),

    octal: $ => seq(choice('0O', '0o'), $.octal_number),
    hex: $ => seq(choice('0x', '0x'), $.hex_number),
    binary: $ => seq(choice('0B', '0b'), $.binary_number),

    dot_access: $ => seq('.', $._any_id),
    bar_access: $ => seq('/', $._any_id),

    _any_id: $ => choice($.symbol_id, $.upper_id, $.lower_id),

    // LEXER
    _line_break: $ => /(\n|\r\n|;)+/,
    _decl_line_break_strict: $ => /(\n|\r\n|;)+/,
    _decl_line_break: $ => prec(100, token.immediate(/\s*(\n|\r\n|;)+/)),
    _ws: $ => /\s+/,

    symbol_id: $ => choice('$', '+', '-', '*', '/', '%', '^', '&', '|', '&&', '||', '!', '~', '==', '!=', '<', '>', '<=', '>=', '<<', '>>'),

    octal_number: $ => /[0-7]+/i,
    hex_number: $ => /[0-8a-fA-F]+/i,
    binary_number: $ => /[0-1]+/i,
    decimal_number: $ => /[0-9]+/i,
    _float_number: $ => /\d+(\.[\d_]+)?/,

    char: $ => /'[^'\\]'/,
    string: $ => /"([^"\\\n\r]|\\[^\n\r])*"/,

    attribute_id: $ => /#[a-zA-Z][a-zA-Z\d_$]*/,
    upper_id: $ => /[A-Z][a-zA-Z\d_$]*/,
    lower_id: $ => /[a-z_][a-zA-Z\d_$]*/,

    hash_bang_line: $ => /#!.*/,

    doc_string: $ => prec(2, token(seq('//!', /.*/))),
    line_comment: $ => prec(1, token(seq('//', /.*/))),
  },
});
