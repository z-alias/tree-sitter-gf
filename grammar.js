/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const basic = require('./basic.js')

module.exports = grammar({
  name: "gf",

  extras: $ => [
    $.comment,
    /[\s\n\t]/
  ],

  rules: {
    source_file: $ => ($.mod_def),
    comment: _ => token(choice(

      prec(100, seq('--', /.*/)),
      seq('{--}'),
      seq(
        '{-',
        /[^#]/,
        repeat(choice(
          /[^-]/, // anything but -
          /-[^}]/, // - not followed by }
        )),
        /-}/,
      ),
    )),


    ident: _ => /[a-zA-Z_'0-9]+/,
    double: $ => $.float,

    mod_def: $ => seq($.compl_mod, $._mod_type, '=', $.mod_body),

    mod_header: $ => seq(optional($.compl_mod), $._mod_type, '=', optional($.mod_header_body)),

    compl_mod: $ => choice(
      alias('incomplete', $.ms_incomplete)
    ),

    _mod_type: $ => choice(
      $.mt_abstract,
      $.mt_resource,
      $.mt_interface,
      $.mt_concrete,
      $.mt_instance
    ),
    mt_abstract: $ => seq('abstract', $.module_name),
    mt_resource: $ => seq('resource', $.module_name),
    mt_interface: $ => seq('interface', $.module_name),
    mt_concrete: $ => seq('concrete', $.module_name, 'of', $.module_name),
    mt_instance: $ => seq('instance', $.module_name, 'of', $.module_name),

    mod_header_body: $ => choice(
      seq($.list_included, '**', $.included, 'with', $.list_inst, '**', optional($.mod_open)),
      seq($.list_included, '**', $.included, 'with', $.list_inst),
      seq($.list_included, '**', optional($.mod_open)),
      seq($.list_included),
      seq($.included, 'with', $.list_inst, '**', optional($.mod_open)),
      seq($.included, 'with', $.list_inst),
      $.mod_open
    ),

    mod_open: $ => seq('open', $.list_open),

    mod_body: $ => choice(
      seq($.list_included, '**', $.included, 'with', $.list_inst, '**', $.mod_content),
      seq($.list_included, '**', $.included, 'with', $.list_inst),
      seq($.list_included, '**', $.mod_content),
      $.list_included,
      seq($.included, 'with', $.list_inst, '**', $.mod_content),
      seq($.included, 'with', $.list_inst),
      seq($.mod_content),
      seq($.mod_body, ';')
    ),

    mod_content: $ => seq(optional(seq('open', $.list_open, 'in')), '{', optional($.list_top_def), '}'),

    list_top_def: $ => seq($._top_def, optional($.list_top_def)),

    list_open: $ => seq($._open, optional(seq(',', $.list_open))),

    _open: $ => choice(
      $.o_simple,
      $.o_qualif
    ),
    o_simple: $ => $.module_name,
    o_qualif: $ => seq('(', $.module_name, '=', $.module_name, ')'),

    list_inst: $ => seq($.inst, optional(seq(',', $.list_inst))),

    inst: $ => seq('(', $.module_name, '=', $.module_name, ')'),

    list_included: $ => seq($.included, optional(seq(',', $.list_included))),

    included: $ => seq($.module_name, optional($._module_included)),

    _module_included: $ => choice(
      $.mi_only,
      $.mi_except
    ),
    mi_only: $ => seq('[', $.list_ident, ']'),
    mi_except: $ => seq('-', '[', $.list_ident, ']'),

    _top_def: $ => choice(
      seq('cat', $.list_cat_def),
      seq('fun', $.list_fun_def),
      seq('def', $.list_def_def),
      seq('data', $.list_data_def),
      seq('param', $.list_param_def),
      seq('oper', $.list_oper_def),
      seq('lincat', $.list_term_def),
      seq('lindef', $.list_term_def),
      seq('linref', $.list_term_def),
      seq('lin', $.list_lin_def),
      seq('printname', 'cat', $.list_term_def),
      seq('printname', 'fun', $.list_term_def),
      seq('flags', $.list_flag_def),
    ),

    cat_def: $ => choice(
      seq($.ident, optional($.list_d_decl)),
      seq('[', $.ident, optional($.list_d_decl), ']'),
      seq('[', $.ident, optional($.list_d_decl), ']', '{', $.integer, '}'),
    ),

    fun_def: $ => seq($.list_ident, ':', $.exp),

    def_def: $ => seq($.lhs_name, optional($.list_patt), '=', $.exp),

    data_def: $ => choice(
      seq($.ident, '=', $.list_data_constr),
      seq($.list_ident, ':', $.exp)
    ),

    param_def: $ => seq($.lhs_ident, optional(seq('=', $.list_par_constr))),

    oper_def: $ => choice(
      seq($.lhs_names, ':', $.exp),
      seq($.lhs_names, '=', $.exp),
      seq($.lhs_name, $.list_arg, '=', $.exp),
      seq($.lhs_names, ':', $.exp, '=', $.exp)
    ),

    lin_def: $ => choice(
      seq($.lhs_names, '=', $.exp),
      seq($.lhs_name, $.list_arg, '=', $.exp)
    ),

    term_def: $ => seq($.lhs_names, '=', $.exp),

    flag_def: $ => seq($.ident, '=', choice($.ident, $.double)),

    list_data_constr: $ => seq($.ident, optional(seq('|', $.list_data_constr))),

    par_constr: $ => seq($.ident, optional($.list_d_decl)),

    list_lin_def: $ => seq($.lin_def, ';', optional($.list_lin_def)),

    list_def_def: $ => seq($.def_def, ';', optional($.list_def_def)),

    list_oper_def: $ => seq($.oper_def, ';', optional($.list_oper_def)),

    list_cat_def: $ => seq($.cat_def, ';', optional($.list_cat_def)),

    list_fun_def: $ => seq($.fun_def, ';', optional($.list_fun_def)),

    list_data_def: $ => seq($.data_def, ';', optional($.list_data_def)),

    list_param_def: $ => seq($.param_def, ';', optional($.list_param_def)),

    list_term_def: $ => seq($.term_def, ';', optional($.list_term_def)),

    list_flag_def: $ => seq($.flag_def, ';', optional($.list_flag_def)),

    list_par_constr: $ => seq($.par_constr, optional(seq('|', $.list_par_constr))),

    list_ident: $ => seq($.ident, optional(seq(',', $.list_ident))),

    list_ident2: $ => seq($.ident, optional($.list_ident2)),

    lhs_ident: $ => choice(
      $.ident,
      seq($.sort)
    ),

    lhs_name: $ => choice(
      $.lhs_ident,
      seq('[', $.lhs_ident, ']')
    ),

    lhs_names: $ => seq($.lhs_name, optional(seq(',', $.lhs_names))),

    loc_def: $ => choice(
      seq($.list_ident, ':', $.exp),
      seq($.list_ident, '=', $.exp),
      seq($.list_ident, ':', $.exp, '=', $.exp)
    ),

    list_loc_def: $ => seq($.loc_def, optional(seq(';', optional($.list_loc_def)))),

    exp: $ => choice(
      seq($.exp1, '|', $.exp),
      seq('\\', $.list_bind, '->', $.exp),
      seq('\\\\', $.list_bind, '=>', $.exp),
      seq($.decl, '->', $.exp),
      seq($.exp3, '=>', $.exp),
      seq('let', '{', optional($.list_loc_def), '}', 'in', $.exp),
      seq('let', optional($.list_loc_def), 'in', $.exp),
      seq($.exp3, 'where', '{', optional($.list_loc_def), '}'),
      seq('in', $.exp5, $.string),
      $.exp1
    ),

    exp1: $ => seq($.exp2, optional(seq('++', $.exp1))),

    exp2: $ => seq($.exp3, optional(seq('+', $.exp2))),

    exp3: $ => choice(
      seq($.exp3, '!', $.exp4),
      seq('table', '{', $.list_case, '}'),
      seq('table', $.exp6, '{', $.list_case, '}'),
      seq('table', $.exp6, '[', optional($.list_exp), ']'),
      seq($.exp3, choice('*', '**'), $.exp4),
      seq($.exp3, '**', '{', $.list_case, '}'),
      $.exp4
    ),

    exp4: $ => choice(
      seq($.exp4, $.exp5),
      seq($.exp4, '{', $.exp, '}'),
      seq('case', $.exp, 'of', '{', $.list_case, '}'),
      seq('variants', '{', optional($.list_exp), '}'),
      seq(
        'pre', 
        '{', 
        choice(
          $.list_case, 
          seq($.string, ';', $.list_altern), 
          seq($.ident, ';', $.list_altern)
        ),
        '}'
      ),
      seq('strs', '{', optional($.list_exp), '}'),
      seq('#', $.patt3),
      seq('pattern', $.exp5),
      seq('lincat', $.ident, $.exp5),
      seq('lin', $.ident, $.exp5),
      $.exp5
    ),

    exp5: $ => choice(
      seq($.exp5, '.', $.label),
      $.exp6
    ),

    exp6: $ => choice(
      $.ident,
      $.sort,
      $.string,
      $.integer,
      $.double,
      '?',
      seq('[', ']'),
      seq('[', $.ident, optional($.exps), ']'),
      seq('[', $.string, ']'),
      seq('{', optional($.list_loc_def), '}'),
      seq('<', optional($.list_tuple_comp), '>'),
      seq('<', $.exp, ':', $.exp, '>'),
      seq('(', $.exp, ')')
    ),

    list_exp: $ => seq($.exp, optional(seq(';', optional($.list_exp)))),

    exps: $ => seq($.exp6, optional($.exps)),

    patt: $ => seq(optional(seq($.patt, choice('|', '+'))), $.patt1),

    patt1: $ => choice(
      seq($.ident, $.list_patt),
      seq($.module_name, '.', $.ident, $.list_patt),
      seq($.patt3, '*'),
      $.patt2
    ),

    patt2: $ => choice(
      seq($.ident, '@', $.patt3),
      seq('-', $.patt3),
      seq('~', $.exp6),
      $.patt3
    ),

    patt3: $ => choice(
      '?',
      seq('[', $.string, ']'),
      seq('#', $.ident),
      seq('#', $.module_name, '.', $.ident),
      '_',
      $.ident,
      seq($.module_name, '.', $.ident),
      $.integer,
      $.double,
      $.string,
      seq('{', optional($.list_patt_ass), '}'),
      seq('<', optional($.list_patt_tuple_comp), '>'),
      seq('(', $.patt, ')')
    ),

    patt_ass: $ => seq($.list_ident, '=', $.patt),

    label: $ => choice(
      $.ident,
      seq('$', $.integer)
    ),

    sort: _ => choice('Type', 'PType', 'Tok', 'Str', 'Strs'),

    list_patt_ass: $ => seq($.patt_ass, optional(seq(';', optional($.list_patt_ass)))),

    list_patt: $ => seq($.patt_arg, optional($.list_patt)),

    patt_arg: $ => choice(
      $.patt2,
      seq('{', $.patt, '}')
    ),

    arg: $ => choice(
      $.ident,
      '_',
      seq('{', $.list_ident2, '}')
    ),

    list_arg: $ => seq($.arg, optional($.list_arg)),

    bind: $ => choice(
      $.ident,
      '_',
      seq('{', $.list_ident, '}')
    ),

    list_bind: $ => seq($.bind, optional(seq(',', $.list_bind))),

    decl: $ => choice(
      seq('(', $.list_bind, ':', $.exp, ')'),
      $.exp3
    ),

    list_tuple_comp: $ => seq($.exp, optional(seq(',', optional($.list_tuple_comp)))),

    list_patt_tuple_comp: $ => seq($.patt, optional(seq(',', optional($.list_patt_tuple_comp)))),
    
    case: $ => seq($.patt, '=>', $.exp),

    list_case: $ => seq($.case, optional(seq(';', $.list_case))),

    altern: $ => seq($.exp, '/', $.exp),

    list_altern: $ => seq($.altern, optional(seq(';', $.list_altern))),

    d_decl: $ => choice(
      seq('(', $.list_bind, ':', $.exp, ')'),
      $.exp6
    ),

    list_d_decl: $ => seq($.d_decl, optional($.list_d_decl)),

    list_cf_rule: $ => seq($.cf_rule, optional($.list_cf_rule)),
    
    cf_rule: $ => choice(
      seq($.ident, '.', $.ident, '::=', optional($.list_cf_symbol), ';'),
      seq($.ident, '::=', $.list_cfrhs, ';'),
      seq('coercions', $.ident, $.integer, ';'),
      seq('terminator', optional($.non_empty), $.ident, $.string, ';'),
      seq('separator', optional($.non_empty), $.ident, $.string, ';')
    ),

    list_cfrhs: $ => seq($.list_cfrhs, optional(seq('|', $.list_cfrhs))),

    list_cf_symbol: $ => seq($.cf_symbol, optional($.list_cf_symbol)),

    cf_symbol: $ => choice(
      $.string,
      $.ident,
      seq('[', $.ident, ']')
    ),

    non_empty: _ => 'nonempty',

    list_ebnf_rule: $ => seq($.ebnf_rule, optional($.list_ebnf_rule)),

    ebnf_rule: $ => seq($.ident, '::=', $.erhs0, ';'),

    erhs0: $ => seq($.erhs1, optional(seq('|', $.erhs0))),

    erhs1: $ => seq($.erhs2, optional($.erhs1)),

    erhs2: $ => seq($.erhs3, optional(choice('*', '+', '?'))),

    erhs3: $ => choice(
      $.string,
      $.ident,
      seq('(', $.erhs0, ')')
    ),

    module_name: $ => choice(
      $.ident
    ),

    ...basic,
  }
  // rules: {
  //   program: $ => repeat(choice(
  //     $.mod_type
  //   )),
  //
  //   ident: _ => /[a-z]+/,
  //
  //     
  //   mod_header: $ => choice($.complMod, '=', $.mod_header_body),
  //
  //   compl_mod: _ => optional('incomplete'),
  //
  //   mod_type: $ => choice(
  //     choice('abstract', $.module_name),
  //     choice('resource', $.module_name),
  //     choice('interface', $.module_name),
  //     choice('concrete', $.module_name, 'of', $.module_name),
  //     choice('instance', $.module_name, 'of', $.module_name),
  //   ),
  //
  //   mod_header_body: $ => choice(
  //     choice($.list_included, '**', $.included, 'with' $.list_inst, '**', $.mod_open)
  //   ),
  //
  //   module_name: $ => $.ident,
  //
  // }
});
