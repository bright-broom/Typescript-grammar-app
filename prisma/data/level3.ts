import type { ProblemSeed } from "./types";

/** テストコード内で型の完全一致を判定するためのヘルパー */
const EQUAL =
  "type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;\n";

export const level3Problems: ProblemSeed[] = [
  // 基本型 Level 3
  {
    id: "primitive-types-3-01",
    category: "primitive-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "stringをベースにしたブランド型UserIdとOrderIdを定義してください。\n- 通常のstringはUserId / OrderIdに直接代入できない\n- UserIdとOrderIdは互いに代入できない\n- UserId / OrderIdはstringとしてそのまま使える",
    starterCode: "type UserId = // ここに型を書いてください\ntype OrderId = // ここに型を書いてください",
    expectedAnswer:
      'type UserId = string & { readonly __brand: "UserId" };\ntype OrderId = string & { readonly __brand: "OrderId" };',
    hints: [
      "type UserId = string と書くと単なる別名になり、stringと区別されません",
      "Intersection型でstringに「目印」となるプロパティを交差させると、構造的に区別できる型になります",
      'string & { readonly __brand: "UserId" } のように、目印の値をリテラル型にして型ごとに変えます',
    ],
    explanation:
      'TypeScriptは構造的型付けのため、type UserId = string は string の別名にすぎず、OrderIdと取り違えても検出できません。string & { readonly __brand: "UserId" } のように、実在しない目印プロパティを交差させた「ブランド型」を使うと、名前的（nominal）な区別を擬似的に実現できます。目印の型を "UserId" / "OrderId" と異なるリテラル型にしているため互いに代入できず、Intersection型なので string としてはそのまま使えます。値を作るときは "user-1" as UserId のように型アサーションを使うか、後の問題のように型ガードやアサーション関数を通します。',
    tags: ["branded types", "intersection", "nominal typing"],
    testCases: [
      {
        description: "UserIdをstringとして使えること",
        code: "declare const id: UserId;\nconst s: string = id;\nconst len: number = id.length;",
        shouldPass: true,
      },
      {
        description: "型アサーションを使えばUserIdを作れること",
        code: 'function findUser(id: UserId) {}\nfindUser("user-1" as UserId);',
        shouldPass: true,
      },
      {
        description: "通常のstringはUserIdに代入できないこと",
        code: 'const id: UserId = "user-1";',
        shouldPass: false,
      },
      {
        description: "OrderIdはUserIdに代入できないこと",
        code: "declare const orderId: OrderId;\nconst userId: UserId = orderId;",
        shouldPass: false,
      },
      {
        description: "UserIdはOrderIdに代入できないこと",
        code: "declare const userId: UserId;\nconst orderId: OrderId = userId;",
        shouldPass: false,
      },
    ],
  },
  {
    id: "primitive-types-3-02",
    category: "primitive-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "汎用的なブランド型を作るBrand<T, B>型を定義してください（Tが元の型、Bがブランド名）。さらに、関数isEmailを型ガードに書き換えて、trueを返したときに引数がEmail型に絞り込まれるようにしてください。",
    starterCode:
      'type Brand<T, B extends string> = // ここに型を書いてください\n\ntype Email = Brand<string, "Email">;\n\n// 型ガードに書き換えてください\nfunction isEmail(value: string): boolean {\n  return value.includes("@");\n}',
    expectedAnswer:
      'type Brand<T, B extends string> = T & { readonly __brand: B };\n\ntype Email = Brand<string, "Email">;\n\nfunction isEmail(value: string): value is Email {\n  return value.includes("@");\n}',
    hints: [
      "ブランド名Bを目印プロパティの型として使います",
      "T & { readonly __brand: B } の形にすると、Bが異なるブランド型は互いに代入できません",
      "型ガードは戻り値の型を value is Email と書きます",
    ],
    explanation:
      'Brand<T, B> のようにジェネリクスで一般化すると、Brand<string, "Email"> や Brand<number, "Positive"> など様々なブランド型を同じ仕組みで作れます。ブランド型の値を安全に作る方法の一つが型ガード（value is Email）です。バリデーションに通った場合だけEmail型に絞り込まれるため、「検証済みの値しか受け付けない関数」を型で表現できます。as Email による型アサーションと違い、検証ロジックと型の絞り込みが結び付く点がポイントです。',
    tags: ["branded types", "generics", "type guard"],
    testCases: [
      {
        description: "isEmailで絞り込むとEmail型として扱えること",
        code: 'const input: string = "taro@example.com";\nif (isEmail(input)) {\n  const email: Email = input;\n}',
        shouldPass: true,
      },
      {
        description: "検証していないstringはEmailに代入できないこと",
        code: 'const email: Email = "taro@example.com";',
        shouldPass: false,
      },
      {
        description: "ブランド名が異なる型は互いに代入できないこと",
        code: 'declare const a: Brand<string, "A">;\nconst b: Brand<string, "B"> = a;',
        shouldPass: false,
      },
      {
        description: "numberのブランド型もnumberとして計算に使えること",
        code: 'declare const p: Brand<number, "Positive">;\nconst n: number = p + 1;',
        shouldPass: true,
      },
    ],
  },
  {
    id: "primitive-types-3-03",
    category: "primitive-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "関数assertPositiveをアサーション関数に書き換えてください。呼び出した後のコードでは、引数に渡した変数がPositiveNumber型として扱われるようにします。",
    starterCode:
      'type PositiveNumber = number & { readonly __brand: "PositiveNumber" };\n\n// アサーション関数に書き換えてください\nfunction assertPositive(value: number): void {\n  if (value <= 0) {\n    throw new Error(`${value} is not positive`);\n  }\n}',
    expectedAnswer:
      'type PositiveNumber = number & { readonly __brand: "PositiveNumber" };\n\nfunction assertPositive(value: number): asserts value is PositiveNumber {\n  if (value <= 0) {\n    throw new Error(`${value} is not positive`);\n  }\n}',
    hints: [
      "TypeScript 3.7で追加されたアサーション関数は、戻り値の型の位置に asserts を書きます",
      "asserts value は「valueがtruthyであること」、asserts value is 型 は「valueがその型であること」を表します",
      "戻り値の型を asserts value is PositiveNumber にします",
    ],
    explanation:
      "アサーション関数（asserts value is T）は、「この関数が例外を投げずに戻ってきたら、valueはT型である」ことを表します。型ガード（value is T）がif文の中だけで絞り込むのに対し、アサーション関数は呼び出し以降のすべてのコードで絞り込みが有効になります。ブランド型と組み合わせると、検証済みの値だけをPositiveNumberとして扱うことができます。なお、アサーション関数を呼び出すときは、関数名が明示的な型を持つ宣言（function宣言や型注釈付きの変数）である必要があります。",
    tags: ["branded types", "assertion function", "asserts"],
    testCases: [
      {
        description: "assertPositiveを呼んだ後はPositiveNumberとして扱えること",
        code: "const n: number = 42;\nassertPositive(n);\nconst p: PositiveNumber = n;",
        shouldPass: true,
      },
      {
        description: "PositiveNumberを要求する関数に渡せること",
        code: "function sqrt(x: PositiveNumber): number {\n  return Math.sqrt(x);\n}\nconst input: number = 9;\nassertPositive(input);\nconst r: number = sqrt(input);",
        shouldPass: true,
      },
      {
        description: "assertPositiveを呼ばずにPositiveNumberへ代入するとエラーになること",
        code: "const n: number = 42;\nconst p: PositiveNumber = n;",
        shouldPass: false,
      },
      {
        description: "数値リテラルを直接PositiveNumberに代入するとエラーになること",
        code: "const p: PositiveNumber = 42;",
        shouldPass: false,
      },
    ],
  },
  // 配列・タプル Level 3
  {
    id: "arrays-tuples-3-01",
    category: "arrays-tuples",
    level: 3,
    difficulty: "hard",
    promptJa:
      "タプル型を操作する次の2つの型を定義してください。\n- Head<T>: 先頭の要素の型（空タプルなら never）\n- Tail<T>: 先頭を除いた残りのタプル型（空タプルなら []）\n例: Head<[1, 2, 3]> は 1、Tail<[1, 2, 3]> は [2, 3]",
    starterCode:
      "type Head<T extends readonly unknown[]> = // ここに型を書いてください\ntype Tail<T extends readonly unknown[]> = // ここに型を書いてください",
    expectedAnswer:
      "type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;\ntype Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : [];",
    hints: [
      "条件型とinferを使って、タプルを「先頭」と「残り」に分解します",
      "[infer H, ...unknown[]] で先頭を、[unknown, ...infer R] で残りを取り出せます",
      "T[0] を使うと、空タプルのとき never ではなく undefined になってしまいます",
    ],
    explanation:
      "タプル型は条件型のパターンマッチで分解できます。T extends [infer H, ...unknown[]] は「1つ以上の要素を持つタプル」にマッチし、先頭要素の型をHに束縛します。空タプル [] はこのパターンにマッチしないため、else側の never（Tailでは []）が返ります。T[0] を使う方法は簡単ですが、Head<[]> が undefined になるため「空の場合はnever」という仕様を満たせません。readonly [...] と書いておくと、as const で作った readonly タプルにもマッチします。",
    tags: ["tuple", "infer", "conditional types"],
    testCases: [
      {
        description: "Headが先頭の要素の型を返すこと",
        code: EQUAL + 'const c1: Equal<Head<[1, 2, 3]>, 1> = true;\nconst c2: Equal<Head<["a"]>, "a"> = true;',
        shouldPass: true,
      },
      {
        description: "Head<[]> が never になること",
        code: EQUAL + "const check: Equal<Head<[]>, never> = true;",
        shouldPass: true,
      },
      {
        description: "Tailが先頭を除いたタプルを返すこと",
        code: EQUAL + "const c1: Equal<Tail<[1, 2, 3]>, [2, 3]> = true;\nconst c2: Equal<Tail<[1]>, []> = true;",
        shouldPass: true,
      },
      {
        description: "Tail<[]> が [] になること",
        code: EQUAL + "const check: Equal<Tail<[]>, []> = true;",
        shouldPass: true,
      },
      {
        description: "Head<[1, 2]> に 2 は代入できないこと",
        code: "const h: Head<[1, 2]> = 2;",
        shouldPass: false,
      },
    ],
  },
  {
    id: "arrays-tuples-3-02",
    category: "arrays-tuples",
    level: 3,
    difficulty: "medium",
    promptJa:
      "タプル型を操作する次の3つの型を定義してください。\n- Concat<A, B>: 2つのタプルを連結した型（例: Concat<[1], [2, 3]> は [1, 2, 3]）\n- Push<T, U>: タプルの末尾にUを追加した型（例: Push<[1], 2> は [1, 2]）\n- Length<T>: タプルの長さを表す数値リテラル型（例: Length<[1, 2, 3]> は 3）",
    starterCode:
      "type Concat<A extends readonly unknown[], B extends readonly unknown[]> = // ここに型を書いてください\ntype Push<T extends readonly unknown[], U> = // ここに型を書いてください\ntype Length<T extends readonly unknown[]> = // ここに型を書いてください",
    expectedAnswer:
      'type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];\ntype Push<T extends readonly unknown[], U> = [...T, U];\ntype Length<T extends readonly unknown[]> = T["length"];',
    hints: [
      "タプル型の中でも、スプレッド構文 ... で別のタプル型を展開できます",
      "[...A, ...B] で連結、[...T, U] で末尾への追加になります",
      'タプル型のlengthプロパティは数値リテラル型なので、T["length"] で長さを取り出せます',
    ],
    explanation:
      'TypeScript 4.0で導入された可変長タプル型（Variadic Tuple Types）により、[...A, ...B] のようにタプル型を型レベルでスプレッドできるようになりました。また、タプル型の length は [1, 2, 3] なら 3 のような数値リテラル型を持つため、T["length"] で長さを取得できます。一方 string[] のような通常の配列型では長さが決まらないため、Length<string[]> は number になります。',
    tags: ["tuple", "variadic tuple", "type manipulation"],
    testCases: [
      {
        description: "Concatが2つのタプルを連結すること",
        code:
          EQUAL +
          "const c1: Equal<Concat<[1, 2], [3]>, [1, 2, 3]> = true;\nconst c2: Equal<Concat<[], []>, []> = true;",
        shouldPass: true,
      },
      {
        description: "Pushが末尾に要素を追加すること",
        code: EQUAL + 'const check: Equal<Push<["a"], "b">, ["a", "b"]> = true;',
        shouldPass: true,
      },
      {
        description: "Lengthがタプルの長さを返すこと",
        code: EQUAL + "const c1: Equal<Length<[1, 2, 3]>, 3> = true;\nconst c2: Equal<Length<[]>, 0> = true;",
        shouldPass: true,
      },
      {
        description: "通常の配列のLengthはnumberになること",
        code: EQUAL + "const check: Equal<Length<string[]>, number> = true;",
        shouldPass: true,
      },
      {
        description: "Concatにタプル以外を渡すとエラーになること",
        code: "type C = Concat<1, [2]>;",
        shouldPass: false,
      },
    ],
  },
  {
    id: "arrays-tuples-3-03",
    category: "arrays-tuples",
    level: 3,
    difficulty: "hard",
    promptJa:
      '2つの配列を連結する関数concatに、可変長タプル型を使って型を付けてください。concat([1, "a"], [true]) の戻り値が (string | number | boolean)[] ではなく、タプル型 [number, string, boolean] になるようにします。',
    starterCode:
      "// 引数のタプル型を保ったまま連結するよう型を付けてください\nfunction concat(a: unknown[], b: unknown[]): unknown[] {\n  return [...a, ...b];\n}",
    expectedAnswer:
      "function concat<T extends unknown[], U extends unknown[]>(a: [...T], b: [...U]): [...T, ...U] {\n  return [...a, ...b] as [...T, ...U];\n}",
    hints: [
      "2つの引数それぞれのタプル型を型パラメータ T, U で受け取ります",
      "引数の型を T ではなく [...T] と書くと、配列リテラルが配列型ではなくタプル型として推論されます",
      "戻り値の型は [...T, ...U] です。実装の [...a, ...b] は配列型に推論されるため、as [...T, ...U] で型アサーションが必要です",
    ],
    explanation:
      '引数の型を [...T]（T extends unknown[]）と書くと、TypeScriptは渡された配列リテラルをタプル型として推論します。単に a: T と書くと、[1, "a"] は (string | number)[] に推論されてしまいます。戻り値の型 [...T, ...U] により、concat([1, "a"], [true]) は [number, string, boolean] となり、length も 3 というリテラル型になります。なお、実装内の [...a, ...b] は TypeScript が配列型として推論するため、戻り値の型に合わせるには型アサーションが必要です。',
    tags: ["variadic tuple", "generics", "inference"],
    testCases: [
      {
        description: "戻り値がタプル型 [number, string, boolean] になること",
        code: 'const r: [number, string, boolean] = concat([1, "a"], [true]);',
        shouldPass: true,
      },
      {
        description: "戻り値のlengthがリテラル型になること",
        code: "const len: 3 = concat([1, 2], [3]).length;",
        shouldPass: true,
      },
      {
        description: "要素の順序が異なる型には代入できないこと",
        code: 'const r: [string, number] = concat([1], ["a"]);',
        shouldPass: false,
      },
      {
        description: "範囲外のインデックスにアクセスするとエラーになること",
        code: 'const r = concat([1], ["a"]);\nconst x = r[2];',
        shouldPass: false,
      },
    ],
  },
  // オブジェクト型 Level 3
  {
    id: "object-types-3-01",
    category: "object-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "関数createBoxは、オブジェクトリテラルを直接渡したときは余分なプロパティがエラーになりますが、一度変数に入れてから渡すとエラーになりません。ジェネリクスを使って、変数経由で渡された場合も BoxOptions にないプロパティを持つオブジェクトを拒否するように、createBoxの引数の型を書き換えてください。",
    starterCode:
      "type BoxOptions = { width: number; height: number };\n\n// 変数経由の余分なプロパティも拒否するように書き換えてください\nfunction createBox(options: BoxOptions): void {}",
    expectedAnswer:
      "type BoxOptions = { width: number; height: number };\n\nfunction createBox<T extends BoxOptions>(\n  options: T & { [K in Exclude<keyof T, keyof BoxOptions>]: never },\n): void {}",
    hints: [
      "余剰プロパティチェックは「新しく作られたオブジェクトリテラル」を直接代入するときにしか働きません",
      "型パラメータ T extends BoxOptions で実際に渡された型を受け取り、BoxOptionsにないキーを Exclude<keyof T, keyof BoxOptions> で求めます",
      "余分なキーの値を never にした型 { [K in Exclude<keyof T, keyof BoxOptions>]: never } と T を交差させます",
    ],
    explanation:
      "TypeScriptの型の互換性は構造的で、「必要なプロパティを持っていれば余分なプロパティがあっても代入可能」です。余剰プロパティチェック（excess property check）は、打ち間違いを防ぐためにオブジェクトリテラルを直接渡したときだけ行われる特別なチェックで、変数を経由すると働きません。ジェネリクスで実際の型Tを受け取り、BoxOptionsに存在しないキーの値を never とする型と交差させると、余分なプロパティを持つ値は（neverに代入できないため）拒否されます。",
    tags: ["excess property check", "structural typing", "generics"],
    testCases: [
      {
        description: "オブジェクトリテラルを直接渡せること",
        code: "createBox({ width: 100, height: 50 });",
        shouldPass: true,
      },
      {
        description: "余分なプロパティのない変数を渡せること",
        code: "const opts = { width: 100, height: 50 };\ncreateBox(opts);",
        shouldPass: true,
      },
      {
        description: "余分なプロパティを持つ変数を渡すとエラーになること",
        code: 'const opts = { width: 100, height: 50, color: "red" };\ncreateBox(opts);',
        shouldPass: false,
      },
      {
        description: "必須のプロパティが足りないとエラーになること",
        code: "createBox({ width: 100 });",
        shouldPass: false,
      },
      {
        description: "オブジェクトリテラルに余分なプロパティがあるとエラーになること",
        code: "createBox({ width: 100, height: 50, depth: 10 });",
        shouldPass: false,
      },
    ],
  },
  {
    id: "object-types-3-02",
    category: "object-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "UsdクラスとEurクラスは構造が同じため、互いに代入できてしまいます。privateなプロパティを追加して、UsdとEurを互いに代入できないようにしてください。amountプロパティは引き続き外部から読めるようにします。",
    starterCode:
      "// 構造が同じでも Usd と Eur を区別できるようにしてください\nclass Usd {\n  constructor(public amount: number) {}\n}\n\nclass Eur {\n  constructor(public amount: number) {}\n}",
    expectedAnswer:
      'class Usd {\n  private readonly currency = "USD";\n  constructor(public amount: number) {}\n}\n\nclass Eur {\n  private readonly currency = "EUR";\n  constructor(public amount: number) {}\n}',
    hints: [
      "TypeScriptではクラスのインスタンス型も構造的に比較されます",
      "private / protected メンバーを持つクラスは、同じ宣言に由来するメンバーを持つ型としか互換になりません",
      '各クラスに private readonly currency = "USD" のようなプロパティを追加します',
    ],
    explanation:
      "TypeScriptのクラスは構造的に比較されるため、publicメンバーの形が同じなら別のクラスのインスタンスも代入できてしまいます（{ amount: 100 } のようなただのオブジェクトも代入可能です）。しかし private / protected メンバーは例外で、「同じクラス宣言（またはそのサブクラス）に由来するprivateメンバー」を持つ型同士でしか互換になりません。そのため、名前が同じ currency であっても Usd と Eur の private プロパティは別物として扱われ、互いに代入できなくなります。これはクラスで名前的型付け（nominal typing）に近い振る舞いを得る方法の一つです。",
    tags: ["structural typing", "class", "private"],
    testCases: [
      {
        description: "Usdのインスタンスを作り、amountを読めること",
        code: "const u: Usd = new Usd(100);\nconst n: number = u.amount;",
        shouldPass: true,
      },
      {
        description: "EurのインスタンスはUsdに代入できないこと",
        code: "const u: Usd = new Eur(100);",
        shouldPass: false,
      },
      {
        description: "UsdのインスタンスはEurに代入できないこと",
        code: "const e: Eur = new Usd(100);",
        shouldPass: false,
      },
      {
        description: "ただのオブジェクトはUsdに代入できないこと",
        code: "const u: Usd = { amount: 100 };",
        shouldPass: false,
      },
      {
        description: "同じ構造を持つ別のクラスもUsdとして渡せないこと",
        code: "class Jpy {\n  constructor(public amount: number) {}\n}\nfunction pay(money: Usd) {}\npay(new Jpy(100));",
        shouldPass: false,
      },
    ],
  },
  {
    id: "object-types-3-03",
    category: "object-types",
    level: 3,
    difficulty: "medium",
    promptJa:
      "プロパティを1つも持たない空のオブジェクトだけを受け入れるEmptyObject型を定義してください。{} 型を使うと、プロパティを持つオブジェクトや文字列まで代入できてしまう点に注意してください。",
    starterCode: "type EmptyObject = // ここに型を書いてください",
    expectedAnswer: "type EmptyObject = Record<string, never>;",
    hints: [
      "{} 型は「空のオブジェクト」ではなく「null / undefined 以外のほぼすべての値」を表します",
      "Index Signatureで「どんなキーの値もnever」とすると、プロパティを持つことができなくなります",
      "Record<string, never>（または { [key: string]: never }）と書きます",
    ],
    explanation:
      "構造的型付けでは「型が要求するプロパティをすべて持っていれば代入可能」です。{} 型は要求するプロパティが1つもないため、{ a: 1 } を入れた変数や、文字列・数値といったプリミティブ値まで代入できてしまいます。Record<string, never> は「任意の文字列キーの値が never」という型なので、プロパティを1つでも持つオブジェクトは代入できず、Index Signatureを持たないプリミティブ型も代入できません。空オブジェクトを表したい場合は {} ではなくこちらを使いましょう。",
    tags: ["structural typing", "index signature", "never"],
    testCases: [
      {
        description: "空のオブジェクトが代入できること",
        code: "const e: EmptyObject = {};",
        shouldPass: true,
      },
      {
        description: "プロパティを持つオブジェクトリテラルは代入できないこと",
        code: "const e: EmptyObject = { a: 1 };",
        shouldPass: false,
      },
      {
        description: "プロパティを持つオブジェクトを変数経由で代入できないこと",
        code: "const obj = { a: 1 };\nconst e: EmptyObject = obj;",
        shouldPass: false,
      },
      {
        description: "値がundefinedのプロパティを持つオブジェクトも代入できないこと",
        code: "const e: EmptyObject = { a: undefined };",
        shouldPass: false,
      },
      {
        description: "文字列は代入できないこと",
        code: 'const e: EmptyObject = "text";',
        shouldPass: false,
      },
    ],
  },
  // Union/Intersection Level 3
  {
    id: "union-intersection-3-01",
    category: "union-intersection",
    level: 3,
    difficulty: "hard",
    promptJa:
      'イベント名をキー、ペイロードの型を値とするオブジェクト型Mから、{ type: イベント名; payload: ペイロードの型 } のUnion型を作るToEventUnion<M>型を定義してください。\n例: ToEventUnion<{ open: string; close: number }> は { type: "open"; payload: string } | { type: "close"; payload: number }',
    starterCode: "type ToEventUnion<M> = // ここに型を書いてください",
    expectedAnswer: "type ToEventUnion<M> = {\n  [K in keyof M]: { type: K; payload: M[K] };\n}[keyof M];",
    hints: [
      "{ type: keyof M; payload: M[keyof M] } では、typeとpayloadの対応関係が失われてしまいます",
      "キーごとに別々のオブジェクト型を作るには、Mapped Typeで { [K in keyof M]: ... } を作ります",
      "作ったMapped Typeに [keyof M] でインデックスアクセスすると、すべての値の型のUnionが得られます",
    ],
    explanation:
      '{ type: keyof M; payload: M[keyof M] } と書くと、typeもpayloadもそれぞれ独立したUnion型になり、「typeが "open" ならpayloadはstring」という対応関係が失われます。{ [K in keyof M]: { type: K; payload: M[K] } } というMapped Typeでキーごとに対応の取れたオブジェクト型を作り、[keyof M] でインデックスアクセスすると、各キーの値の型がUnionとして取り出されます。この「Mapped Typeを作ってすぐ [keyof M] で取り出す」パターンは、Union型の各メンバーに変換を分配したいときの定番テクニックで、型パラメータ K extends keyof M = keyof M を追加して分配条件型（K extends keyof M ? { type: K; payload: M[K] } : never）で書いても同じ結果を得られます。',
    tags: ["discriminated union", "mapped types", "indexed access", "distribution"],
    testCases: [
      {
        description: "キーごとに対応したUnion型が生成されること",
        code:
          EQUAL +
          'const check: Equal<\n  ToEventUnion<{ click: { x: number; y: number }; keypress: { key: string } }>,\n  { type: "click"; payload: { x: number; y: number } } | { type: "keypress"; payload: { key: string } }\n> = true;',
        shouldPass: true,
      },
      {
        description: "typeとpayloadの対応が正しいオブジェクトが代入できること",
        code: 'type AppEvent = ToEventUnion<{ open: string; close: number }>;\nconst e: AppEvent = { type: "open", payload: "home" };',
        shouldPass: true,
      },
      {
        description: "typeとpayloadの対応が誤っているとエラーになること",
        code: 'type AppEvent = ToEventUnion<{ open: string; close: number }>;\nconst e: AppEvent = { type: "open", payload: 1 };',
        shouldPass: false,
      },
      {
        description: "typeで絞り込むとpayloadの型が決まること",
        code: 'type AppEvent = ToEventUnion<{ open: string; close: number }>;\nfunction handle(e: AppEvent) {\n  if (e.type === "close") {\n    const code: number = e.payload;\n  }\n}',
        shouldPass: true,
      },
    ],
  },
  {
    id: "union-intersection-3-02",
    category: "union-intersection",
    level: 3,
    difficulty: "hard",
    promptJa:
      "Union型をIntersection型に変換するUnionToIntersection<U>型を定義してください。例: UnionToIntersection<{ a: string } | { b: number }> は { a: string } & { b: number } になります。",
    starterCode: "type UnionToIntersection<U> = // ここに型を書いてください",
    expectedAnswer:
      "type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void\n  ? I\n  : never;",
    hints: [
      "まず分配条件型で、Unionの各メンバーを「そのメンバーを引数に取る関数型」に変換します",
      "関数の引数の位置は反変（contravariant）です。反変の位置にある複数の候補からinferすると、Intersection型が推論されます",
      "(U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never と書きます",
    ],
    explanation:
      "この型は2段階で動作します。まず U extends unknown ? (arg: U) => void : never が分配され、((arg: { a: string }) => void) | ((arg: { b: number }) => void) という関数型のUnionになります。次に、それを (arg: infer I) => void にマッチさせます。関数の引数は反変の位置にあり、反変の位置で同じ型変数に複数の候補がある場合、TypeScriptはそれらのIntersection型を推論します（両方の関数として使える引数は、両方の型を満たす必要があるためです）。その結果、I は { a: string } & { b: number } になります。",
    tags: ["union", "intersection", "infer", "contravariance"],
    testCases: [
      {
        description: "オブジェクト型のUnionがIntersection型になること",
        code:
          EQUAL +
          "const check: Equal<UnionToIntersection<{ a: string } | { b: number }>, { a: string } & { b: number }> = true;",
        shouldPass: true,
      },
      {
        description: "両方のプロパティを持つオブジェクトが代入できること",
        code: 'const v: UnionToIntersection<{ a: string } | { b: number }> = { a: "x", b: 1 };',
        shouldPass: true,
      },
      {
        description: "片方のプロパティしか持たないとエラーになること",
        code: 'const v: UnionToIntersection<{ a: string } | { b: number }> = { a: "x" };',
        shouldPass: false,
      },
      {
        description: "関数型のUnionはオーバーロードのようなIntersection型になること",
        code:
          EQUAL +
          "const check: Equal<\n  UnionToIntersection<((x: string) => void) | ((x: number) => void)>,\n  ((x: string) => void) & ((x: number) => void)\n> = true;",
        shouldPass: true,
      },
    ],
  },
  {
    id: "union-intersection-3-03",
    category: "union-intersection",
    level: 3,
    difficulty: "hard",
    promptJa:
      'Union型のメンバーのすべての並べ方をタプル型のUnionとして返すPermutation<T>型を定義してください。\n例: Permutation<"A" | "B"> は ["A", "B"] | ["B", "A"]、Permutation<never> は []',
    starterCode: "type Permutation<T> = // ここに型を書いてください",
    expectedAnswer:
      "type Permutation<T, K = T> = [T] extends [never]\n  ? []\n  : K extends K\n    ? [K, ...Permutation<Exclude<T, K>>]\n    : never;",
    hints: [
      "「先頭に1つ選び、残りを再帰的に並べる」を、Unionの各メンバーについて行います。型パラメータを追加して Permutation<T, K = T> としても構いません",
      "K extends K ? ... のように裸の型パラメータで条件型を書くと、Kの各メンバーについて分配されます。残りのメンバーは Exclude<T, K> で求められます",
      "再帰の終了条件は「Tがneverかどうか」ですが、T extends never は分配されてしまうため [T] extends [never] で判定します",
    ],
    explanation:
      "Permutation<T, K = T> では、Kを分配用、Tを「残りの全体」として使います。K extends K ? [K, ...Permutation<Exclude<T, K>>] : never はKの各メンバーに分配され、「Kを先頭に置き、残り Exclude<T, K> の並べ方を後ろに続ける」タプルをUnionとして集めます。メンバーがなくなると T は never になるので、[T] extends [never] で空タプル [] を返して再帰を終えます。ここで T extends never と書くと、neverに対する分配条件型は never を返すため、[K, ...never] 全体が never になって正しく動きません。分配条件型の性質（分配と、neverの扱い）を両方使うパズルです。",
    tags: ["union", "distributive", "recursive types", "tuple"],
    testCases: [
      {
        description: '"A" | "B" の並べ方が2通りになること',
        code: EQUAL + 'const check: Equal<Permutation<"A" | "B">, ["A", "B"] | ["B", "A"]> = true;',
        shouldPass: true,
      },
      {
        description: '"A" | "B" | "C" の並べ方が6通りになること',
        code:
          EQUAL +
          'const check: Equal<\n  Permutation<"A" | "B" | "C">,\n  ["A", "B", "C"] | ["A", "C", "B"] | ["B", "A", "C"] | ["B", "C", "A"] | ["C", "A", "B"] | ["C", "B", "A"]\n> = true;',
        shouldPass: true,
      },
      {
        description: "Permutation<never> が [] になること",
        code: EQUAL + "const check: Equal<Permutation<never>, []> = true;",
        shouldPass: true,
      },
      {
        description: '同じメンバーを重複させた ["A", "A"] は代入できないこと',
        code: 'const p: Permutation<"A" | "B"> = ["A", "A"];',
        shouldPass: false,
      },
    ],
  },
  // 関数型 Level 3
  {
    id: "function-types-3-01",
    category: "function-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "関数を受け取り、呼び出し時にログを出力するラッパー関数を返す高階関数withLoggingに型を付けてください。返される関数は、元の関数fnとまったく同じ引数と戻り値の型を持つようにします。",
    starterCode:
      '// fnと同じ引数・戻り値の型を持つ関数を返すように型を付けてください\nfunction withLogging(fn: (...args: any[]) => any): (...args: any[]) => any {\n  return (...args) => {\n    console.log("called with", args);\n    return fn(...args);\n  };\n}',
    expectedAnswer:
      'function withLogging<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {\n  return (...args) => {\n    console.log("called with", args);\n    return fn(...args);\n  };\n}',
    hints: [
      "引数リスト全体を1つの型パラメータ（タプル型）として扱うことができます",
      "(...args: A) => R の形で、A extends unknown[] を引数のタプル型、R を戻り値の型として推論させます",
      "function withLogging<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R と書きます",
    ],
    explanation:
      "Rest引数の型に型パラメータ A extends unknown[] を使うと、関数の引数リスト全体をタプル型として推論できます。withLogging(add) では A が [a: number, b: number]、R が number と推論され、返される関数も (...args: [a: number, b: number]) => number、つまり (a: number, b: number) => number になります。省略可能な引数もタプルの省略可能要素として保持されます。(...args: any[]) => any を使うと、ラッパーを通した時点で引数と戻り値の型情報がすべて失われてしまいます。デコレータやミドルウェアのような「関数を包む関数」で頻出するパターンです。",
    tags: ["higher-order function", "generics", "rest parameters", "tuple"],
    testCases: [
      {
        description: "ラップした関数が元の関数と同じ戻り値の型を持つこと",
        code: "const add = (a: number, b: number) => a + b;\nconst logged = withLogging(add);\nconst r: number = logged(1, 2);",
        shouldPass: true,
      },
      {
        description: "引数の型が異なるとエラーになること",
        code: 'const add = (a: number, b: number) => a + b;\nconst logged = withLogging(add);\nlogged("1", 2);',
        shouldPass: false,
      },
      {
        description: "引数が足りないとエラーになること",
        code: "const add = (a: number, b: number) => a + b;\nconst logged = withLogging(add);\nlogged(1);",
        shouldPass: false,
      },
      {
        description: "戻り値の型が異なる変数には代入できないこと",
        code: 'const len = withLogging((s: string) => s.length);\nconst r: string = len("abc");',
        shouldPass: false,
      },
      {
        description: "省略可能な引数も保持されること",
        code: 'const greet = withLogging((name: string, greeting?: string) => `${greeting ?? "Hello"}, ${name}`);\nconst s: string = greet("Taro");',
        shouldPass: true,
      },
    ],
  },
  {
    id: "function-types-3-02",
    category: "function-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "関数greetの中で使っているthisの型が不明なため、型エラーになっています。thisパラメータを使って、thisが { name: string } 型であることを指定してください。",
    starterCode:
      "// thisの型を指定してください\nfunction greet(greeting: string): string {\n  return `${greeting}, ${this.name}`;\n}",
    expectedAnswer:
      "function greet(this: { name: string }, greeting: string): string {\n  return `${greeting}, ${this.name}`;\n}",
    hints: [
      "strictモード（noImplicitThis）では、型が分からないthisの使用はエラーになります",
      "関数の最初の引数に this という名前の「thisパラメータ」を書くと、thisの型を指定できます",
      "function greet(this: { name: string }, greeting: string): string と書きます",
    ],
    explanation:
      'thisパラメータは関数の第1引数の位置に this: 型 と書く特別な構文で、関数内のthisの型を指定します。JavaScriptに変換すると消える「偽の引数」なので、呼び出し時に引数として渡す必要はありません。thisパラメータを指定すると、呼び出し方もチェックされます。user.greet("Hello") のように name を持つオブジェクトのメソッドとして呼ぶのはOKですが、greet("Hello") と単独で呼ぶと this が void になるためエラーになります。また strictBindCallApply により、greet.call({ age: 20 }, "Hi") のような誤ったthisの指定も検出されます。',
    tags: ["this parameter", "function", "call"],
    testCases: [
      {
        description: "nameを持つオブジェクトのメソッドとして呼び出せること",
        code: 'const user = { name: "Taro", greet };\nconst s: string = user.greet("Hello");',
        shouldPass: true,
      },
      {
        description: "thisを指定せずに単独で呼び出すとエラーになること",
        code: 'greet("Hello");',
        shouldPass: false,
      },
      {
        description: "callで正しいthisを指定して呼び出せること",
        code: 'const s: string = greet.call({ name: "Hanako" }, "Hi");',
        shouldPass: true,
      },
      {
        description: "callでnameを持たないthisを指定するとエラーになること",
        code: 'greet.call({ age: 20 }, "Hi");',
        shouldPass: false,
      },
      {
        description: "nameを持たないオブジェクトのメソッドとして呼ぶとエラーになること",
        code: 'const obj = { title: "TypeScript", greet };\nobj.greet("Hello");',
        shouldPass: false,
      },
    ],
  },
  {
    id: "function-types-3-03",
    category: "function-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "Vue.jsのOptions APIのような defineComponent 関数を作っています。methods内のメソッドで、this.count のように data のプロパティや他のメソッドへアクセスできるよう、ComponentOptions型のmethodsにThisTypeを使って this の型（D & M）を指定してください。",
    starterCode:
      "type ComponentOptions<D, M> = {\n  data: D;\n  methods: M; // ここを修正して、メソッド内の this の型を D & M にしてください\n};\n\nfunction defineComponent<D, M>(options: ComponentOptions<D, M>): D & M {\n  return { ...options.data, ...options.methods };\n}",
    expectedAnswer:
      "type ComponentOptions<D, M> = {\n  data: D;\n  methods: M & ThisType<D & M>;\n};\n\nfunction defineComponent<D, M>(options: ComponentOptions<D, M>): D & M {\n  return { ...options.data, ...options.methods };\n}",
    hints: [
      "オブジェクトリテラル内のメソッドのthisは、通常そのオブジェクトリテラル自身の型になります",
      "組み込みの ThisType<T> を文脈的な型に含めると、オブジェクトリテラル内のメソッドのthisの型をTに指定できます",
      "methods: M & ThisType<D & M> と書きます",
    ],
    explanation:
      "ThisType<T> は中身が空の特別なマーカー型で、オブジェクトリテラルの文脈的な型に含まれていると、そのリテラル内のメソッドの this の型がTになります（noImplicitThisが有効な場合に機能します）。M & ThisType<D & M> とすることで、Mはmethodsのオブジェクトリテラルから推論されつつ、メソッド内のthisは data と methods を合成した D & M として扱われます。ThisTypeがない場合、methods内のthisはmethodsオブジェクト自身の型になるため、this.count にアクセスできません。",
    tags: ["ThisType", "this", "generics", "inference"],
    testCases: [
      {
        description: "メソッド内でthis経由でdataにアクセスでき、戻り値からも使えること",
        code: "const counter = defineComponent({\n  data: { count: 0 },\n  methods: {\n    increment() {\n      this.count++;\n    },\n  },\n});\ncounter.increment();\nconst n: number = counter.count;",
        shouldPass: true,
      },
      {
        description: "メソッド内でthis経由で他のメソッドを呼び出せること",
        code: "const counter = defineComponent({\n  data: { count: 0 },\n  methods: {\n    increment() {\n      this.count++;\n    },\n    incrementTwice() {\n      this.increment();\n      this.increment();\n    },\n  },\n});",
        shouldPass: true,
      },
      {
        description: "存在しないプロパティにアクセスするとエラーになること",
        code: "defineComponent({\n  data: { count: 0 },\n  methods: {\n    reset() {\n      this.total = 0;\n    },\n  },\n});",
        shouldPass: false,
      },
      {
        description: "dataのプロパティに異なる型の値を代入するとエラーになること",
        code: 'defineComponent({\n  data: { count: 0 },\n  methods: {\n    reset() {\n      this.count = "zero";\n    },\n  },\n});',
        shouldPass: false,
      },
    ],
  },
  // ジェネリクス Level 3
  {
    id: "generics-3-01",
    category: "generics",
    level: 3,
    difficulty: "hard",
    promptJa:
      '2つのオブジェクトをマージする関数mergeに型を付けてください。同じキーがある場合は2つ目のオブジェクトbの値で上書きされるので、戻り値の型もbのプロパティの型が優先されるようにします。例: merge({ a: 1, b: "x" }, { b: 2 }) の戻り値の型は b が number になります。',
    starterCode:
      "// 2つ目のオブジェクトのプロパティで上書きした型を返すように型を付けてください\nfunction merge(a: object, b: object): object {\n  return { ...a, ...b };\n}",
    expectedAnswer:
      "function merge<A extends object, B extends object>(a: A, b: B): Omit<A, keyof B> & B {\n  return { ...a, ...b };\n}",
    hints: [
      "2つの引数の型をそれぞれ型パラメータ A, B として受け取ります",
      "戻り値を A & B にすると、同じキーの型が交差して string & number = never のようになってしまいます",
      "Aからbと重複するキーを取り除いた型と B を交差させます: Omit<A, keyof B> & B",
    ],
    explanation:
      "複数の型パラメータを使うと、引数ごとの型を独立して推論できます。スプレッド構文 { ...a, ...b } では後ろのプロパティが優先されますが、戻り値の型を A & B とすると、キーbの型が string & number（= never）になってしまい、実際の値の型と一致しません。Omit<A, keyof B> で A から B と重複するキーを取り除いてから B と交差させることで、「Bで上書きされた型」を正確に表現できます。",
    tags: ["generics", "multiple type parameters", "Omit", "intersection"],
    testCases: [
      {
        description: "重複するキーはbの型になり、それ以外はaの型が残ること",
        code: 'const m = merge({ a: 1, b: "x" }, { b: 2 });\nconst b: number = m.b;\nconst a: number = m.a;',
        shouldPass: true,
      },
      {
        description: "上書きされたキーをaの型（string）として扱えないこと",
        code: 'const m = merge({ a: 1, b: "x" }, { b: 2 });\nconst b: string = m.b;',
        shouldPass: false,
      },
      {
        description: "重複しないキーは両方のプロパティを持つこと",
        code: 'const m = merge({ id: 1 }, { name: "Taro" });\nconst id: number = m.id;\nconst name2: string = m.name;',
        shouldPass: true,
      },
      {
        description: "オブジェクト以外は渡せないこと",
        code: "merge(1, { b: 2 });",
        shouldPass: false,
      },
      {
        description: "存在しないプロパティにアクセスするとエラーになること",
        code: "const m = merge({ a: 1 }, { b: 2 });\nm.c;",
        shouldPass: false,
      },
    ],
  },
  {
    id: "generics-3-02",
    category: "generics",
    level: 3,
    difficulty: "hard",
    promptJa:
      '文字列の配列から、キーと値が同じオブジェクトを作る関数defineEnumに型を付けてください。defineEnum(["red", "green"]) の戻り値の型が { red: "red"; green: "green" } になるように、配列の要素をリテラル型として推論させます。as const で作った readonly 配列も渡せるようにしてください。',
    starterCode:
      "// 配列の要素をリテラル型として推論させるように型を付けてください\nfunction defineEnum(values: string[]): Record<string, string> {\n  return Object.fromEntries(values.map((v) => [v, v]));\n}",
    expectedAnswer:
      "function defineEnum<const T extends readonly string[]>(values: T): { [K in T[number]]: K } {\n  return Object.fromEntries(values.map((v) => [v, v])) as { [K in T[number]]: K };\n}",
    hints: [
      '通常、["red", "green"] は string[] と推論され、リテラル型の情報が失われます',
      "TypeScript 5.0以降では、型パラメータに const 修飾子を付けると、呼び出し側で as const を書いたように推論されます",
      "<const T extends readonly string[]> で受け取り、戻り値の型を { [K in T[number]]: K } にします。as const の readonly 配列も受け付けるには、制約を readonly string[] にする必要があります",
    ],
    explanation:
      'TypeScript 5.0で導入された const 型パラメータ（<const T>）を使うと、引数の配列リテラルが as const を付けたときと同じように readonly ["red", "green"] と推論されます。T[number] で要素のUnion型 "red" | "green" を取り出し、Mapped Type { [K in T[number]]: K } でキーと値が同じオブジェクト型を作ります。なお、制約を string[]（readonlyでない配列）にすると、as const で作った readonly 配列は制約を満たさないため渡せません。readonly string[] は string[] と readonly 配列の両方を受け付けるので、配列を受け取る型パラメータの制約は readonly にしておくのが無難です。<T extends string>(values: readonly T[]) のように要素の型をパラメータにする書き方でも、要素はリテラル型として推論されます。',
    tags: ["generics", "const type parameter", "inference", "mapped types"],
    testCases: [
      {
        description: "要素がリテラル型としてプロパティの型になること",
        code: 'const Color = defineEnum(["red", "green", "blue"]);\nconst r: "red" = Color.red;',
        shouldPass: true,
      },
      {
        description: "配列にない値のプロパティにアクセスするとエラーになること",
        code: 'const Color = defineEnum(["red", "green"]);\nColor.yellow;',
        shouldPass: false,
      },
      {
        description: "プロパティの値の型が別のリテラル型と区別されること",
        code: 'const Color = defineEnum(["red", "green"]);\nconst g: "red" = Color.green;',
        shouldPass: false,
      },
      {
        description: "as const で作った readonly 配列も渡せること",
        code: 'const sizes = ["sm", "lg"] as const;\nconst Size = defineEnum(sizes);\nconst s: "sm" = Size.sm;',
        shouldPass: true,
      },
      {
        description: "文字列以外の配列は渡せないこと",
        code: "defineEnum([1, 2]);",
        shouldPass: false,
      },
    ],
  },
  {
    id: "generics-3-03",
    category: "generics",
    level: 3,
    difficulty: "hard",
    promptJa:
      '選択肢の配列optionsとデフォルト値defaultValueを受け取る関数selectOptionがあります。現在は selectOption(["sm", "md"], "xl") のように選択肢にない値を渡してもエラーになりません。Tの推論にdefaultValueが使われないようにして、defaultValueがoptionsのいずれかでなければエラーになるようにしてください。',
    starterCode:
      "// defaultValueが選択肢にない値ならエラーになるように型を修正してください\nfunction selectOption<T extends string>(options: T[], defaultValue: T): T {\n  return defaultValue;\n}",
    expectedAnswer:
      "function selectOption<T extends string>(options: T[], defaultValue: NoInfer<T>): T {\n  return defaultValue;\n}",
    hints: [
      '今のコードでは、Tがoptionsとdefaultから推論されるため "sm" | "md" | "xl" になってしまいます',
      "TypeScript 5.4で追加された NoInfer<T> で囲んだ位置は、型パラメータの推論候補として使われなくなります",
      "defaultValue の型を NoInfer<T> にします（別解: 2つ目の型パラメータ D extends T を使う方法もあります）",
    ],
    explanation:
      '型パラメータが複数の引数に登場すると、TypeScriptはすべての位置から推論候補を集めます。そのため selectOption(["sm", "md"], "xl") では T が "sm" | "md" | "xl" と推論され、エラーになりません。NoInfer<T> は「この位置からは推論しない」ことを指示するユーティリティ型で、Tはoptionsだけから "sm" | "md" と推論され、その後でdefaultValueがチェックされます。TypeScript 5.4より前は、<T extends string, D extends T>(options: T[], defaultValue: D) のように推論用の型パラメータを分ける方法がよく使われていました。',
    tags: ["generics", "NoInfer", "inference"],
    testCases: [
      {
        description: "選択肢に含まれるデフォルト値を渡せること",
        code: 'const s: "sm" | "md" | "lg" = selectOption(["sm", "md", "lg"], "md");',
        shouldPass: true,
      },
      {
        description: "選択肢にないデフォルト値を渡すとエラーになること",
        code: 'selectOption(["sm", "md", "lg"], "xl");',
        shouldPass: false,
      },
      {
        description: "戻り値の型が選択肢のUnion型になること",
        code: 'const s: "sm" | "md" = selectOption(["sm", "md", "lg"], "sm");',
        shouldPass: false,
      },
      {
        description: "型注釈付きの配列も渡せること",
        code: 'const opts: ("on" | "off")[] = ["on", "off"];\nconst v: "on" | "off" = selectOption(opts, "off");',
        shouldPass: true,
      },
    ],
  },
  // ユーティリティ型 Level 3
  {
    id: "utility-types-3-01",
    category: "utility-types",
    level: 3,
    difficulty: "medium",
    promptJa:
      "関数createUserの型から、次の2つの型を定義してください。\n- CreateUserArgs: 引数のタプル型（Parametersを使用）\n- User: 戻り値の型（ReturnTypeを使用）",
    starterCode:
      "function createUser(name: string, age: number, isAdmin?: boolean) {\n  return { id: Math.random(), name, age, isAdmin: isAdmin ?? false };\n}\n\ntype CreateUserArgs = // Parametersを使って書いてください\ntype User = // ReturnTypeを使って書いてください",
    expectedAnswer:
      "function createUser(name: string, age: number, isAdmin?: boolean) {\n  return { id: Math.random(), name, age, isAdmin: isAdmin ?? false };\n}\n\ntype CreateUserArgs = Parameters<typeof createUser>;\ntype User = ReturnType<typeof createUser>;",
    hints: [
      "ParametersやReturnTypeには「関数の型」を渡す必要があります。関数（値）から型を得るには typeof を使います",
      "Parameters<typeof createUser> は引数をタプル型として返します",
      "ReturnType<typeof createUser> で戻り値の型が得られます",
    ],
    explanation:
      "Parameters<F> と ReturnType<F> は、それぞれ条件型とinferで関数型から引数のタプル型・戻り値の型を取り出すユーティリティ型です。型引数には関数の「型」が必要なため、関数宣言からは typeof createUser で型を取得して渡します。戻り値の型を別途定義しなくても、関数の実装から推論された型を再利用できるため、実装を変更したときに型が自動で追従します。省略可能な引数 isAdmin? は、タプル型の省略可能な要素として表現されます。",
    tags: ["utility types", "Parameters", "ReturnType", "typeof"],
    testCases: [
      {
        description: "CreateUserArgsが引数のタプル型と一致すること",
        code: EQUAL + "const check: Equal<CreateUserArgs, [name: string, age: number, isAdmin?: boolean]> = true;",
        shouldPass: true,
      },
      {
        description: "CreateUserArgsの値をスプレッドしてcreateUserを呼べること",
        code: 'const args: CreateUserArgs = ["Taro", 20];\ncreateUser(...args);',
        shouldPass: true,
      },
      {
        description: "必須の引数が足りないタプルはエラーになること",
        code: 'const args: CreateUserArgs = ["Taro"];',
        shouldPass: false,
      },
      {
        description: "Userが戻り値のオブジェクト型と一致すること",
        code: EQUAL + "const check: Equal<User, { id: number; name: string; age: number; isAdmin: boolean }> = true;",
        shouldPass: true,
      },
      {
        description: "isAdminが欠けたオブジェクトはUserに代入できないこと",
        code: 'const u: User = { id: 1, name: "Taro", age: 20 };',
        shouldPass: false,
      },
    ],
  },
  {
    id: "utility-types-3-02",
    category: "utility-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "クラス（コンストラクタ）とそのコンストラクタ引数を受け取り、インスタンスを生成する関数createInstanceに型を付けてください。ConstructorParametersとInstanceTypeを使い、引数の型チェックと戻り値のインスタンス型の推論が行われるようにします。",
    starterCode:
      "class HttpClient {\n  constructor(public baseUrl: string, public options?: { timeout: number }) {}\n}\n\n// ConstructorParameters と InstanceType を使って型を付けてください\nfunction createInstance(ctor: any, ...args: any[]): any {\n  return new ctor(...args);\n}",
    expectedAnswer:
      "class HttpClient {\n  constructor(public baseUrl: string, public options?: { timeout: number }) {}\n}\n\nfunction createInstance<C extends new (...args: any[]) => any>(\n  ctor: C,\n  ...args: ConstructorParameters<C>\n): InstanceType<C> {\n  return new ctor(...args);\n}",
    hints: [
      "クラスそのもの（コンストラクタ）の型は new (...args: any[]) => any のようなコンストラクトシグネチャで表せます",
      "ConstructorParameters<C> でコンストラクタ引数のタプル型、InstanceType<C> でインスタンスの型が得られます",
      "<C extends new (...args: any[]) => any>(ctor: C, ...args: ConstructorParameters<C>): InstanceType<C> と書きます",
    ],
    explanation:
      "クラス名を値として使うとき、その型は「コンストラクタ関数の型」（typeof HttpClient）で、インスタンスの型 HttpClient とは別物です。new (...args: any[]) => any はコンストラクトシグネチャで、newで呼び出せる型を表します。ConstructorParameters<C> はコンストラクタの引数をタプル型として、InstanceType<C> はnewしたときに得られるインスタンスの型を取り出します。Rest引数の型を ConstructorParameters<C> にすることで、createInstance(HttpClient, 123) のような誤った引数も検出できます。",
    tags: ["utility types", "ConstructorParameters", "InstanceType", "class"],
    testCases: [
      {
        description: "HttpClientのインスタンスを生成できること",
        code: 'const client: HttpClient = createInstance(HttpClient, "https://api.example.com");',
        shouldPass: true,
      },
      {
        description: "省略可能な引数も渡せ、戻り値のプロパティが型付けされていること",
        code: 'const client = createInstance(HttpClient, "https://api.example.com", { timeout: 3000 });\nconst url: string = client.baseUrl;',
        shouldPass: true,
      },
      {
        description: "コンストラクタ引数の型が異なるとエラーになること",
        code: "createInstance(HttpClient, 123);",
        shouldPass: false,
      },
      {
        description: "必須のコンストラクタ引数が足りないとエラーになること",
        code: "createInstance(HttpClient);",
        shouldPass: false,
      },
      {
        description: "別のクラスのインスタンスはHttpClientとして扱えないこと",
        code: "class Point2D {\n  constructor(public x: number, public y: number) {}\n}\nconst c: HttpClient = createInstance(Point2D, 1, 2);",
        shouldPass: false,
      },
    ],
  },
  {
    id: "utility-types-3-03",
    category: "utility-types",
    level: 3,
    difficulty: "medium",
    promptJa:
      "async関数fetchUserの型から、次の2つの型を定義してください。\n- FetchUserParam: 引数idの型（Parametersを使用）\n- FetchedUser: Promiseが解決された後の値の型（ReturnTypeとAwaitedを使用）",
    starterCode:
      'async function fetchUser(id: number) {\n  return { id, name: "Taro", roles: ["admin"] };\n}\n\ntype FetchUserParam = // Parametersを使って書いてください\ntype FetchedUser = // ReturnTypeとAwaitedを使って書いてください',
    expectedAnswer:
      'async function fetchUser(id: number) {\n  return { id, name: "Taro", roles: ["admin"] };\n}\n\ntype FetchUserParam = Parameters<typeof fetchUser>[0];\ntype FetchedUser = Awaited<ReturnType<typeof fetchUser>>;',
    hints: [
      "Parametersはタプル型を返すので、インデックスアクセス [0] で第1引数の型を取り出せます",
      "async関数の戻り値の型は Promise<...> です",
      "Awaited<ReturnType<typeof fetchUser>> で Promise を外した型が得られます",
    ],
    explanation:
      "async関数の戻り値の型は常に Promise<T> になるため、ReturnType だけでは Promise<{ id: number; ... }> が得られます。Awaited<T>（TypeScript 4.5で追加）は Promise（正確には then メソッドを持つ thenable）を再帰的に展開して、await したときに得られる型を返します。また Parameters<F> はタプル型なので、[0] でインデックスアクセスすると特定の引数の型だけを取り出せます。",
    tags: ["utility types", "Awaited", "ReturnType", "Parameters"],
    testCases: [
      {
        description: "FetchUserParamがnumberであること",
        code: EQUAL + "const check: Equal<FetchUserParam, number> = true;",
        shouldPass: true,
      },
      {
        description: "FetchedUserがPromiseを外したオブジェクト型と一致すること",
        code: EQUAL + "const check: Equal<FetchedUser, { id: number; name: string; roles: string[] }> = true;",
        shouldPass: true,
      },
      {
        description: "fetchUserの戻り値は Promise<FetchedUser> として扱えること",
        code: "const p: Promise<FetchedUser> = fetchUser(1);",
        shouldPass: true,
      },
      {
        description: "awaitせずにFetchedUserへ代入するとエラーになること",
        code: "const u: FetchedUser = fetchUser(1);",
        shouldPass: false,
      },
    ],
  },
  // 条件型 Level 3
  {
    id: "conditional-types-3-01",
    category: "conditional-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      '文字列リテラル型の前後にあるスペース（" "）をすべて取り除くTrim<S>型を、再帰的な条件型で定義してください。例: Trim<"  hello  "> は "hello"',
    starterCode: "type Trim<S extends string> = // ここに型を書いてください",
    expectedAnswer:
      "type TrimLeft<S extends string> = S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;\ntype TrimRight<S extends string> = S extends `${infer Rest} ` ? TrimRight<Rest> : S;\ntype Trim<S extends string> = TrimRight<TrimLeft<S>>;",
    hints: [
      "テンプレートリテラル型のパターンとinferで、先頭の1文字（スペース）を取り除いた残りを取り出せます",
      "` ${infer Rest}` にマッチしたら Rest に対して同じ型を再帰的に適用し、マッチしなくなったら S を返します",
      "左側を削る TrimLeft と右側を削る TrimRight を作り、TrimRight<TrimLeft<S>> と組み合わせます",
    ],
    explanation:
      "条件型は自分自身を参照して再帰的に定義できます（TypeScript 4.1以降）。S extends ` ${infer Rest}` は「先頭がスペースで始まる文字列」にマッチし、スペースを除いた残りを Rest に束縛します。マッチする限り再帰を続け、マッチしなくなった時点のSを返すことで、先頭のスペースをすべて取り除けます。末尾も `${infer Rest} ` で同様に処理します。1回のマッチだけでは複数のスペースに対応できないため、再帰が必要になります。なお、再帰の深さには上限（末尾再帰の形なら1000回程度）があります。",
    tags: ["conditional types", "recursive types", "template literal types", "infer"],
    testCases: [
      {
        description: "前後の複数のスペースが取り除かれること",
        code: EQUAL + 'const check: Equal<Trim<"  hello  ">, "hello"> = true;',
        shouldPass: true,
      },
      {
        description: "スペースがない場合と、途中のスペースはそのまま残ること",
        code: EQUAL + 'const c1: Equal<Trim<"hello">, "hello"> = true;\nconst c2: Equal<Trim<" a b ">, "a b"> = true;',
        shouldPass: true,
      },
      {
        description: "スペースだけの文字列は空文字列になること",
        code: EQUAL + 'const check: Equal<Trim<"   ">, ""> = true;',
        shouldPass: true,
      },
      {
        description: "スペースが残った文字列は代入できないこと",
        code: 'const t: Trim<"  hi"> = "  hi";',
        shouldPass: false,
      },
    ],
  },
  {
    id: "conditional-types-3-02",
    category: "conditional-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      'スネークケースの文字列リテラル型をキャメルケースに変換するSnakeToCamel<S>型を定義してください。例: SnakeToCamel<"created_at_time"> は "createdAtTime"',
    starterCode: "type SnakeToCamel<S extends string> = // ここに型を書いてください",
    expectedAnswer:
      "type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`\n  ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`\n  : S;",
    hints: [
      "`${infer Head}_${infer Tail}` で、最初の _ の前後に分割できます",
      "組み込みの Capitalize<S> で文字列リテラル型の先頭を大文字にできます",
      "Tailにはまだ _ が残っている可能性があるので、SnakeToCamel<Tail> を再帰的に適用してから Capitalize します",
    ],
    explanation:
      '`${infer Head}_${infer Tail}` のように infer を並べると、先頭側の Head は最初に現れる _ までの最短の文字列にマッチし、残りがすべて Tail に入ります。"created_at_time" では Head が "created"、Tail が "at_time" です。Tail を再帰的に変換して "atTime" にし、Capitalize で "AtTime" にしてから連結すると "createdAtTime" が得られます。_ を含まなくなったら S をそのまま返します。条件型は裸の型パラメータに対して分配されるので、Unionを渡すと各メンバーがそれぞれ変換されます。',
    tags: ["conditional types", "recursive types", "template literal types", "Capitalize"],
    testCases: [
      {
        description: '"user_name" が "userName" になること',
        code: EQUAL + 'const check: Equal<SnakeToCamel<"user_name">, "userName"> = true;',
        shouldPass: true,
      },
      {
        description: '複数の _ を含む "created_at_time" が "createdAtTime" になること',
        code: EQUAL + 'const check: Equal<SnakeToCamel<"created_at_time">, "createdAtTime"> = true;',
        shouldPass: true,
      },
      {
        description: "_ を含まない文字列はそのままであること",
        code: EQUAL + 'const check: Equal<SnakeToCamel<"id">, "id"> = true;',
        shouldPass: true,
      },
      {
        description: "Unionの各メンバーが変換されること",
        code: EQUAL + 'const check: Equal<SnakeToCamel<"user_id" | "post_id">, "userId" | "postId"> = true;',
        shouldPass: true,
      },
      {
        description: "変換前の文字列は代入できないこと",
        code: 'const k: SnakeToCamel<"first_name"> = "first_name";',
        shouldPass: false,
      },
    ],
  },
  {
    id: "conditional-types-3-03",
    category: "conditional-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      'ルートパスの文字列リテラル型から、:で始まるパラメータ名をUnion型として取り出すRouteParams<S>型を定義してください。\n例: RouteParams<"/users/:userId/posts/:postId"> は "userId" | "postId"、パラメータがなければ never',
    starterCode: "type RouteParams<S extends string> = // ここに型を書いてください",
    expectedAnswer:
      "type RouteParams<S extends string> = S extends `${string}:${infer Param}/${infer Rest}`\n  ? Param | RouteParams<Rest>\n  : S extends `${string}:${infer Param}`\n    ? Param\n    : never;",
    hints: [
      "`${string}:${infer Param}/${infer Rest}` で、「最初のパラメータ名」と「その後ろの残りのパス」に分解できます",
      "残りのパス Rest にもパラメータが含まれるかもしれないので、RouteParams<Rest> を再帰的に適用して Param とUnionにします",
      "末尾のパラメータ（後ろに / がない場合）は `${string}:${infer Param}` で別途マッチさせ、どちらにもマッチしなければ never を返します",
    ],
    explanation:
      'テンプレートリテラル型のパターンでは、${string} は任意の文字列に、infer は直後の区切り文字（ここでは /）が最初に現れる位置までにマッチします。"/users/:userId/posts/:postId" は1つ目の分岐で Param = "userId"、Rest = "posts/:postId" に分解され、Rest を再帰処理すると2つ目の分岐で "postId" が得られます。結果をUnionでつなげることで、すべてのパラメータ名を集められます。Express や Next.js などのルーティングライブラリでも、この種の型が使われています。',
    tags: ["conditional types", "recursive types", "template literal types", "infer"],
    testCases: [
      {
        description: "パラメータが1つの場合",
        code: EQUAL + 'const check: Equal<RouteParams<"/users/:id">, "id"> = true;',
        shouldPass: true,
      },
      {
        description: "複数のパラメータがUnion型になること",
        code: EQUAL + 'const check: Equal<RouteParams<"/users/:userId/posts/:postId">, "userId" | "postId"> = true;',
        shouldPass: true,
      },
      {
        description: "パラメータの後ろに固定のパスが続く場合",
        code: EQUAL + 'const check: Equal<RouteParams<"/orgs/:orgId/members">, "orgId"> = true;',
        shouldPass: true,
      },
      {
        description: "パラメータがなければ never になること",
        code: EQUAL + 'const check: Equal<RouteParams<"/about">, never> = true;',
        shouldPass: true,
      },
      {
        description: "存在しないパラメータ名は代入できないこと",
        code: 'const p: RouteParams<"/users/:id"> = "userId";',
        shouldPass: false,
      },
    ],
  },
  // Mapped Types Level 3
  {
    id: "mapped-types-3-01",
    category: "mapped-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      'オブジェクト型Tのうち、指定したキーKだけをオプショナルにし、それ以外のプロパティはそのまま（readonlyなどの修飾子も保持）にするPartialBy<T, K>型を定義してください。例: PartialBy<{ id: number; email: string }, "email"> は { id: number; email?: string } と同等です。',
    starterCode: "type PartialBy<T, K extends keyof T> = // ここに型を書いてください",
    expectedAnswer: "type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;",
    hints: [
      "「Kのプロパティだけの型」と「K以外のプロパティの型」に分けて考えます",
      "Pick<T, K> と Omit<T, K> で分割し、片方だけを Partial にします",
      "Omit<T, K> & Partial<Pick<T, K>> と書きます",
    ],
    explanation:
      "複雑な変換は、既存のMapped Type（Pick / Omit / Partial など）を組み合わせると簡潔に書けます。Omit<T, K> でオプショナルにしないプロパティを、Partial<Pick<T, K>> でオプショナルにするプロパティを作り、Intersection型で合成します。Pick や Omit は準同型なMapped Typeを経由するため、readonly などの元の修飾子も保持されます。Intersection型のままだとエディタ上の表示が分かりにくいため、実務では { [P in keyof X]: X[P] } のようなMapped Typeで包んで1つのオブジェクト型に展開することもあります。",
    tags: ["mapped types", "Partial", "Pick", "Omit"],
    testCases: [
      {
        description: "指定したキーだけがオプショナルになること",
        code:
          EQUAL +
          'type Expand<T> = { [K in keyof T]: T[K] };\nconst check: Equal<\n  Expand<PartialBy<{ id: number; name: string; email: string }, "email">>,\n  { id: number; name: string; email?: string }\n> = true;',
        shouldPass: true,
      },
      {
        description: "readonly修飾子が保持されること",
        code:
          EQUAL +
          'type Expand<T> = { [K in keyof T]: T[K] };\nconst check: Equal<\n  Expand<PartialBy<{ readonly id: number; name: string }, "name">>,\n  { readonly id: number; name?: string }\n> = true;',
        shouldPass: true,
      },
      {
        description: "複数のキーをオプショナルにできること",
        code: 'const u: PartialBy<{ id: number; name: string; email: string }, "name" | "email"> = { id: 1 };',
        shouldPass: true,
      },
      {
        description: "指定していないキーは必須のままであること",
        code: 'const u: PartialBy<{ id: number; name: string; email: string }, "email"> = { id: 1 };',
        shouldPass: false,
      },
      {
        description: "存在しないキーを指定するとエラーになること",
        code: 'type R = PartialBy<{ id: number }, "age">;',
        shouldPass: false,
      },
    ],
  },
  {
    id: "mapped-types-3-02",
    category: "mapped-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      "オブジェクト型Tの各プロパティKについて、「on + 先頭を大文字にしたキー名 + Change」という名前で、新しい値（T[K]）を受け取ってvoidを返すハンドラを持つChangeHandlers<T>型を定義してください。すべてのハンドラはオプショナルにし、元のプロパティのreadonlyは取り除きます。\n例: ChangeHandlers<{ name: string }> は { onNameChange?: (value: string) => void }",
    starterCode: "type ChangeHandlers<T> = // ここに型を書いてください",
    expectedAnswer:
      "type ChangeHandlers<T> = {\n  -readonly [K in keyof T as `on${Capitalize<string & K>}Change`]?: (value: T[K]) => void;\n};",
    hints: [
      "as 句によるKey Remappingと、テンプレートリテラル型・Capitalizeを組み合わせてキー名を作ります",
      "Mapped Typeの修飾子は ? で追加、-readonly で削除できます",
      "-readonly [K in keyof T as `on${Capitalize<string & K>}Change`]?: (value: T[K]) => void と書きます",
    ],
    explanation:
      "Mapped Typeでは、キー名の変換（as 句）、修飾子の追加・削除（? / -? / readonly / -readonly）、値の型の変換を1つの定義の中で組み合わせられます。in keyof T を使った準同型Mapped Typeは、as 句でキーを変換しても元のプロパティの修飾子を引き継ぐため、元がreadonlyのプロパティから作ったハンドラもreadonlyになります。-readonly を付けることで、それを明示的に取り除いています。",
    tags: ["mapped types", "key remapping", "modifiers", "template literal types"],
    testCases: [
      {
        description: "ハンドラ名と引数の型が正しく生成されること",
        code:
          EQUAL +
          "const check: Equal<\n  ChangeHandlers<{ name: string; age: number }>,\n  { onNameChange?: (value: string) => void; onAgeChange?: (value: number) => void }\n> = true;",
        shouldPass: true,
      },
      {
        description: "元のreadonlyが取り除かれること",
        code:
          EQUAL +
          "const check: Equal<ChangeHandlers<{ readonly id: number }>, { onIdChange?: (value: number) => void }> = true;",
        shouldPass: true,
      },
      {
        description: "ハンドラを省略した空オブジェクトが代入できること",
        code: "const h: ChangeHandlers<{ name: string; age: number }> = {};",
        shouldPass: true,
      },
      {
        description: "ハンドラの引数の型が異なるとエラーになること",
        code: "const h: ChangeHandlers<{ age: number }> = { onAgeChange: (value: string) => {} };",
        shouldPass: false,
      },
    ],
  },
  {
    id: "mapped-types-3-03",
    category: "mapped-types",
    level: 3,
    difficulty: "hard",
    promptJa:
      'オブジェクト型Tのうち、必須（?が付いていない）プロパティのキーだけをUnion型として取り出すRequiredKeys<T>型を定義してください。値の型に undefined を含んでいても、? が付いていなければ必須キーとして扱います。\n例: RequiredKeys<{ a: string; b?: number; c: boolean | undefined }> は "a" | "c"',
    starterCode: "type RequiredKeys<T> = // ここに型を書いてください",
    expectedAnswer: "type RequiredKeys<T> = {\n  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;\n}[keyof T];",
    hints: [
      "Mapped Typeで「必須ならキー名K、オプショナルならnever」を値に持つ型を作り、最後に [keyof T] で値のUnionを取り出します",
      "undefined extends T[K] では「? が付いている」と「値の型に undefined を含む」を区別できません。Pick<T, K> が空オブジェクト {} を受け入れるかどうかで判定します",
      "オプショナルなプロパティは Mapped Type でもオプショナルのまま残り、取り出すと undefined が混ざるので、-? で取り除きます",
    ],
    explanation:
      "Pick<T, K> は「キーKだけを持つオブジェクト型」で、Kがオプショナルなら { b?: number } のように空オブジェクト {} を代入できます。そのため {} extends Pick<T, K> が真ならオプショナル、偽なら必須と判定できます。値の型で undefined extends T[K] と判定すると、c: boolean | undefined のような「必須だがundefinedを許容する」プロパティを誤ってオプショナル扱いしてしまいます。また、準同型Mapped Typeは ? を引き継ぐため、-? を付けないと [keyof T] で取り出したときに undefined が結果に混ざります。「Mapped Typeで値を作り、[keyof T] で取り出す」「修飾子の削除」「条件型」を組み合わせた応用パターンです。",
    tags: ["mapped types", "conditional types", "modifiers", "indexed access"],
    testCases: [
      {
        description: "必須プロパティのキーだけが取り出されること",
        code: EQUAL + 'const check: Equal<RequiredKeys<{ a: string; b?: number; c: boolean }>, "a" | "c"> = true;',
        shouldPass: true,
      },
      {
        description: "値の型にundefinedを含んでも、?がなければ必須キーとして扱われること",
        code: EQUAL + 'const check: Equal<RequiredKeys<{ a: string | undefined; b?: string }>, "a"> = true;',
        shouldPass: true,
      },
      {
        description: "すべてオプショナルなら never になること",
        code: EQUAL + "const check: Equal<RequiredKeys<{ a?: string; b?: number }>, never> = true;",
        shouldPass: true,
      },
      {
        description: "オプショナルなキーは代入できないこと",
        code: 'const k: RequiredKeys<{ id: number; note?: string }> = "note";',
        shouldPass: false,
      },
    ],
  },
  // 型パズル Level 3
  {
    id: "advanced-patterns-3-01",
    category: "advanced-patterns",
    level: 3,
    difficulty: "hard",
    promptJa:
      "オブジェクトのすべてのプロパティを、ネストしたオブジェクトや配列の中まで再帰的に読み取り専用にするDeepReadonly<T>型を定義してください。関数型のプロパティは、そのまま呼び出せるように変換しないでください。",
    starterCode: "type DeepReadonly<T> = // ここに型を書いてください",
    expectedAnswer:
      "type DeepReadonly<T> = {\n  readonly [K in keyof T]: T[K] extends (...args: any[]) => any\n    ? T[K]\n    : T[K] extends object\n      ? DeepReadonly<T[K]>\n      : T[K];\n};",
    hints: [
      "Readonly<T> は1階層目のプロパティにしか readonly を付けません",
      "プロパティの型がオブジェクトなら DeepReadonly を再帰的に適用します",
      "関数型もobjectに該当するため、先に (...args: any[]) => any かどうかを判定して、関数ならそのまま返します",
    ],
    explanation:
      "Mapped Typeの値の位置で自分自身を再帰的に参照すると、ネストした構造全体を変換できます。T[K] extends object で再帰するかを判定しますが、関数型もobjectに該当するため、関数を先に除外しないとMapped Typeが適用されて呼び出しシグネチャが失われてしまいます。配列（string[] など）に準同型Mapped Typeを適用すると readonly string[] のような読み取り専用配列になるので、push なども禁止されます。type-challengesでも定番の問題です。",
    tags: ["type challenges", "recursive types", "mapped types", "readonly"],
    testCases: [
      {
        description: "ネストしたプロパティまでreadonlyになること",
        code:
          EQUAL +
          "const check: Equal<\n  DeepReadonly<{ a: { b: { c: number } }; d: string }>,\n  { readonly a: { readonly b: { readonly c: number } }; readonly d: string }\n> = true;",
        shouldPass: true,
      },
      {
        description: "ネストしたプロパティを変更するとエラーになること",
        code: "declare const cfg: DeepReadonly<{ server: { port: number } }>;\ncfg.server.port = 8080;",
        shouldPass: false,
      },
      {
        description: "配列のプロパティにpushできないこと",
        code: 'declare const cfg: DeepReadonly<{ tags: string[] }>;\ncfg.tags.push("new");',
        shouldPass: false,
      },
      {
        description: "関数型のプロパティは呼び出せること",
        code: "declare const obj: DeepReadonly<{ greet: () => string }>;\nconst s: string = obj.greet();",
        shouldPass: true,
      },
    ],
  },
  {
    id: "advanced-patterns-3-02",
    category: "advanced-patterns",
    level: 3,
    difficulty: "hard",
    promptJa:
      "任意の深さにネストしたタプル型を平坦化するFlatten<T>型を定義してください。例: Flatten<[1, [2, [3, [4]]]]> は [1, 2, 3, 4]",
    starterCode: "type Flatten<T extends readonly unknown[]> = // ここに型を書いてください",
    expectedAnswer:
      "type Flatten<T extends readonly unknown[]> = T extends readonly [infer Head, ...infer Rest]\n  ? Head extends readonly unknown[]\n    ? [...Flatten<Head>, ...Flatten<Rest>]\n    : [Head, ...Flatten<Rest>]\n  : [];",
    hints: [
      "タプルを [infer Head, ...infer Rest] で先頭と残りに分解し、先頭から1つずつ処理します",
      "Headが配列ならHead自体も平坦化して展開し、そうでなければそのまま先頭に置きます",
      "Head extends readonly unknown[] ? [...Flatten<Head>, ...Flatten<Rest>] : [Head, ...Flatten<Rest>] とし、空タプルになったら [] を返します",
    ],
    explanation:
      "タプルの再帰処理は「先頭を処理 + 残りを再帰」という形で書くのが基本です。先頭の要素Headが配列なら Flatten<Head> で再帰的に平坦化してから展開し、配列でなければそのまま残します。残りの要素 Rest にも Flatten を適用し、可変長タプル型のスプレッド [...A, ...B] で連結します。要素がなくなると [infer Head, ...infer Rest] にマッチしなくなるので、空タプル [] を返して再帰を終えます。",
    tags: ["type challenges", "recursive types", "tuple", "infer"],
    testCases: [
      {
        description: "ネストしていないタプルはそのままであること",
        code: EQUAL + "const check: Equal<Flatten<[1, 2, 3]>, [1, 2, 3]> = true;",
        shouldPass: true,
      },
      {
        description: "深くネストしたタプルが平坦化されること",
        code: EQUAL + "const check: Equal<Flatten<[1, [2, 3], [4, [5, [6]]]]>, [1, 2, 3, 4, 5, 6]> = true;",
        shouldPass: true,
      },
      {
        description: "空タプルと、要素1つの深いネストを処理できること",
        code:
          EQUAL +
          'const c1: Equal<Flatten<[]>, []> = true;\nconst c2: Equal<Flatten<[[[["deep"]]]]>, ["deep"]> = true;',
        shouldPass: true,
      },
      {
        description: "平坦化前のタプルは代入できないこと",
        code: "const f: Flatten<[1, [2]]> = [1, [2]];",
        shouldPass: false,
      },
      {
        description: "配列以外を渡すとエラーになること",
        code: "type F = Flatten<string>;",
        shouldPass: false,
      },
    ],
  },
  {
    id: "advanced-patterns-3-03",
    category: "advanced-patterns",
    level: 3,
    difficulty: "hard",
    promptJa:
      'オブジェクト型Tから、"server.port" のようなドット区切りのパスPで指定したプロパティの型を取り出すGet<T, P>型を定義してください。パスが存在しない場合は never を返します。',
    starterCode: "type Get<T, P extends string> = // ここに型を書いてください",
    expectedAnswer:
      "type Get<T, P extends string> = P extends `${infer Key}.${infer Rest}`\n  ? Key extends keyof T\n    ? Get<T[Key], Rest>\n    : never\n  : P extends keyof T\n    ? T[P]\n    : never;",
    hints: [
      "`${infer Key}.${infer Rest}` で、パスを最初の . の前（Key）と後ろ（Rest）に分割します",
      "Key が T のキーなら、T[Key] と Rest で再帰します。キーでなければ never です",
      ". を含まない最後のパスは、P extends keyof T ? T[P] : never で処理します",
    ],
    explanation:
      "パス文字列をテンプレートリテラル型で「先頭のキー」と「残りのパス」に分解し、1階層ずつ T[Key] に潜っていく再帰型です。Key extends keyof T で存在チェックを行い、存在しなければ never を返します。. がなくなった最後のセグメントは P extends keyof T で直接インデックスアクセスします。lodash の get や、i18n ライブラリの翻訳キーなど、文字列パスで値にアクセスするAPIの型付けに使われるパターンです。",
    tags: ["type challenges", "recursive types", "template literal types", "indexed access"],
    testCases: [
      {
        description: "トップレベルのプロパティの型を取り出せること",
        code:
          EQUAL +
          'type AppSettings = { server: { host: string; port: number; tls: { enabled: boolean } }; debug: boolean };\nconst check: Equal<Get<AppSettings, "debug">, boolean> = true;',
        shouldPass: true,
      },
      {
        description: "ネストしたプロパティの型を取り出せること",
        code:
          EQUAL +
          'type AppSettings = { server: { host: string; port: number; tls: { enabled: boolean } }; debug: boolean };\nconst c1: Equal<Get<AppSettings, "server.port">, number> = true;\nconst c2: Equal<Get<AppSettings, "server.tls.enabled">, boolean> = true;',
        shouldPass: true,
      },
      {
        description: "オブジェクト型のプロパティもそのまま取り出せること",
        code:
          EQUAL +
          'type AppSettings = { server: { host: string; port: number; tls: { enabled: boolean } }; debug: boolean };\nconst check: Equal<Get<AppSettings, "server.tls">, { enabled: boolean }> = true;',
        shouldPass: true,
      },
      {
        description: "存在しないパスは never になること",
        code:
          EQUAL +
          'type AppSettings = { server: { host: string; port: number; tls: { enabled: boolean } }; debug: boolean };\nconst c1: Equal<Get<AppSettings, "server.password">, never> = true;\nconst c2: Equal<Get<AppSettings, "client.port">, never> = true;',
        shouldPass: true,
      },
      {
        description: "取り出した型と異なる値は代入できないこと",
        code: 'type AppSettings = { server: { host: string; port: number; tls: { enabled: boolean } }; debug: boolean };\nconst host: Get<AppSettings, "server.host"> = 8080;',
        shouldPass: false,
      },
    ],
  },
];
