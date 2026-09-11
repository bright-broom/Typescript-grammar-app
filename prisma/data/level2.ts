import type { ProblemSeed } from "./types";

/** テストコード内で型の完全一致を判定するためのヘルパー */
const EQUAL =
  "type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;\n";

export const level2Problems: ProblemSeed[] = [
  // 基本型 Level 2
  {
    id: "primitive-types-2-01",
    category: "primitive-types",
    level: 2,
    difficulty: "easy",
    promptJa:
      'letで宣言した変数currentを、関数moveにそのまま渡せるようにしてください。letのまま、currentに "up" | "down" のDirection型の型注釈を付けます。',
    starterCode:
      'type Direction = "up" | "down";\n\nfunction move(direction: Direction): void {}\n\n// currentに型注釈を付けてください\nlet current = "up";',
    expectedAnswer:
      'type Direction = "up" | "down";\n\nfunction move(direction: Direction): void {}\n\nlet current: Direction = "up";',
    hints: [
      "letで宣言した変数の型は、初期値のリテラル型ではなく広い型に推論されます",
      'let current = "up" の型は "up" ではなく string になっています',
      'let current: Direction = "up" のように型注釈を付けましょう',
    ],
    explanation:
      'constで宣言した変数は再代入できないため、const x = "up" の型はリテラル型 "up" になります。一方letは再代入できるため、let x = "up" の型は string に「拡大（widening）」されます。stringは "up" | "down" に代入できないので、letのまま使いたい場合はリテラル型のUnionで型注釈を付けます。こうすると "down" への再代入は許可され、"left" のような不正な値は弾かれます。',
    tags: ["literal types", "widening", "let/const"],
    testCases: [
      {
        description: "currentをmoveに渡せること",
        code: "move(current)",
        shouldPass: true,
      },
      {
        description: '"down"を再代入できること',
        code: 'current = "down"',
        shouldPass: true,
      },
      {
        description: '"left"は代入できないこと',
        code: 'current = "left"',
        shouldPass: false,
      },
    ],
  },
  {
    id: "primitive-types-2-02",
    category: "primitive-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      'テンプレートリテラル型を使って、"16px" のような「数値 + px」、または "50%" のような「数値 + %」の文字列だけを許容するCssLength型を定義してください。',
    starterCode: "type CssLength = // ここに型を書いてください",
    expectedAnswer: "type CssLength = `${number}px` | `${number}%`",
    hints: [
      "テンプレートリテラル型はバッククォートで文字列の形を型として表現します",
      "`${number}` は数値として解釈できる文字列にマッチします",
      "`${number}px` と `${number}%` をUnionでつなげます",
    ],
    explanation:
      'テンプレートリテラル型を使うと「特定のパターンを持つ文字列」を型で表現できます。`${number}px` は "16px" や "1.5px"、"-4px" にマッチしますが、"px"（数値部分が空）や "10em" にはマッチしません。`${string}px` にしてしまうと "px" や "abcpx" も許容してしまうため、数値部分は number で表現するのがポイントです。',
    tags: ["template literal types", "literal types"],
    testCases: [
      {
        description: '"16px" と "1.5px" が代入できること',
        code: 'const a: CssLength = "16px"; const b: CssLength = "1.5px"',
        shouldPass: true,
      },
      {
        description: '"50%" が代入できること',
        code: 'const a: CssLength = "50%"',
        shouldPass: true,
      },
      {
        description: '"10em" は代入できないこと',
        code: 'const a: CssLength = "10em"',
        shouldPass: false,
      },
      {
        description: '数値部分がない "px" は代入できないこと',
        code: 'const a: CssLength = "px"',
        shouldPass: false,
      },
    ],
  },
  {
    id: "primitive-types-2-03",
    category: "primitive-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      'Size型とColor型を組み合わせて、"sm-red" や "lg-blue" のように「サイズ-色」の形式を持つすべての組み合わせを表すClassName型を、テンプレートリテラル型で定義してください。',
    starterCode:
      'type Size = "sm" | "md" | "lg";\ntype Color = "red" | "blue";\n\ntype ClassName = // ここに型を書いてください',
    expectedAnswer:
      'type Size = "sm" | "md" | "lg";\ntype Color = "red" | "blue";\n\ntype ClassName = `${Size}-${Color}`',
    hints: [
      "テンプレートリテラル型の ${ } の中には型を埋め込めます",
      "Union型を埋め込むと、すべての組み合わせのUnion型が生成されます",
      "`${Size}-${Color}` と書きます",
    ],
    explanation:
      'テンプレートリテラル型の埋め込み位置にUnion型を置くと、各メンバーの組み合わせ（直積）がUnion型として展開されます。Sizeが3種類、Colorが2種類なので、ClassNameは "sm-red" | "sm-blue" | "md-red" | ... の6種類になります。手書きで列挙するよりも、元の型を変更したときに自動で追従できるのが利点です。',
    tags: ["template literal types", "union"],
    testCases: [
      {
        description: '"sm-red" と "lg-blue" が代入できること',
        code: 'const a: ClassName = "sm-red"; const b: ClassName = "lg-blue"',
        shouldPass: true,
      },
      {
        description: "6通りの組み合わせのUnion型と一致すること",
        code:
          EQUAL +
          'const check: Equal<ClassName, "sm-red" | "sm-blue" | "md-red" | "md-blue" | "lg-red" | "lg-blue"> = true',
        shouldPass: true,
      },
      {
        description: '存在しないサイズ "xl-red" は代入できないこと',
        code: 'const a: ClassName = "xl-red"',
        shouldPass: false,
      },
      {
        description: '順序が逆の "red-sm" は代入できないこと',
        code: 'const a: ClassName = "red-sm"',
        shouldPass: false,
      },
    ],
  },
  // 配列・タプル Level 2
  {
    id: "arrays-tuples-2-01",
    category: "arrays-tuples",
    level: 2,
    difficulty: "easy",
    promptJa:
      "赤・緑・青の3つのnumberと、省略可能な4番目の要素（アルファ値、number）を持つタプル型RGBAを定義してください。",
    starterCode: "type RGBA = // ここに型を書いてください",
    expectedAnswer: "type RGBA = [r: number, g: number, b: number, a?: number]",
    hints: [
      "タプルの要素にも ? を付けて省略可能にできます",
      "[r: number, g: number] のように要素にラベルを付けると読みやすくなります",
      "[r: number, g: number, b: number, a?: number] と書きます",
    ],
    explanation:
      "タプル型の要素に ? を付けると、その要素を省略可能にできます（省略可能な要素の後ろに必須の要素は置けません）。この場合のlengthの型は 3 | 4 になります。また [r: number, ...] のようなラベル付きタプルを使うと、型の意味がエディタ上でも分かりやすくなります。ラベルは型の互換性には影響しません。",
    tags: ["tuple", "optional element", "labeled tuple"],
    testCases: [
      {
        description: "3要素のタプルが代入できること",
        code: "const c: RGBA = [255, 0, 0]",
        shouldPass: true,
      },
      {
        description: "4要素のタプルが代入でき、4番目は number | undefined であること",
        code: "const c: RGBA = [255, 0, 0, 0.5]; const a: number | undefined = c[3]",
        shouldPass: true,
      },
      {
        description: "2要素ではエラーになること",
        code: "const c: RGBA = [255, 0]",
        shouldPass: false,
      },
      {
        description: "5要素ではエラーになること",
        code: "const c: RGBA = [255, 0, 0, 1, 1]",
        shouldPass: false,
      },
      {
        description: "アルファ値がstringだとエラーになること",
        code: 'const c: RGBA = [255, 0, 0, "0.5"]',
        shouldPass: false,
      },
    ],
  },
  {
    id: "arrays-tuples-2-02",
    category: "arrays-tuples",
    level: 2,
    difficulty: "medium",
    promptJa:
      '先頭の要素がstring（系列名）で、その後に0個以上のnumberが続くタプル型Seriesを定義してください。例: ["sales"], ["sales", 100, 200, 300]',
    starterCode: "type Series = // ここに型を書いてください",
    expectedAnswer: "type Series = [string, ...number[]]",
    hints: [
      "タプルの中でも ... を使ってRest要素を書けます",
      "固定の要素と可変長の要素を組み合わせられます",
      "[string, ...number[]] と書きます",
    ],
    explanation:
      "タプル型の中に ...number[] のようなRest要素を書くと、「固定の要素 + 可変長の要素」を表現できます。(string | number)[] と違い、先頭がstringで残りがnumberという位置ごとの型の制約を保てます。関数のRest引数の型としてもよく使われます。",
    tags: ["tuple", "rest element", "variadic tuple"],
    testCases: [
      {
        description: "系列名のみのタプルが代入できること",
        code: 'const s: Series = ["sales"]',
        shouldPass: true,
      },
      {
        description: "系列名の後に複数の数値を持てること",
        code: 'const s: Series = ["sales", 100, 200, 300]',
        shouldPass: true,
      },
      {
        description: "先頭がnumberだとエラーになること",
        code: "const s: Series = [100, 200]",
        shouldPass: false,
      },
      {
        description: "2番目以降にstringがあるとエラーになること",
        code: 'const s: Series = ["sales", "100"]',
        shouldPass: false,
      },
      {
        description: "空配列はエラーになること",
        code: "const s: Series = []",
        shouldPass: false,
      },
    ],
  },
  {
    id: "arrays-tuples-2-03",
    category: "arrays-tuples",
    level: 2,
    difficulty: "medium",
    promptJa:
      '最後の要素が必ずnumber（インデックス）で、その前に0個以上のstringが続くタプル型IndexedPathを定義してください。例: [0], ["users", "items", 3]',
    starterCode: "type IndexedPath = // ここに型を書いてください",
    expectedAnswer: "type IndexedPath = [...string[], number]",
    hints: [
      "Rest要素はタプルの末尾以外にも置けます",
      "Rest要素を先頭に置き、その後ろに固定の要素を書きます",
      "[...string[], number] と書きます",
    ],
    explanation:
      "TypeScript 4.2以降では、Rest要素をタプルの先頭や途中にも置けます。[...string[], number] は「0個以上のstringの後に、必ずnumberが1つ来る」タプルです。ただし、Rest要素の後ろに別のRest要素や省略可能な要素（?）は置けないといった制約があります。",
    tags: ["tuple", "rest element", "variadic tuple"],
    testCases: [
      {
        description: "numberのみのタプルが代入できること",
        code: "const p: IndexedPath = [0]",
        shouldPass: true,
      },
      {
        description: "stringの後にnumberが続くタプルが代入できること",
        code: 'const p: IndexedPath = ["users", "items", 3]',
        shouldPass: true,
      },
      {
        description: "最後がstringだとエラーになること",
        code: 'const p: IndexedPath = ["users"]',
        shouldPass: false,
      },
      {
        description: "最後以外の位置にnumberがあるとエラーになること",
        code: 'const p: IndexedPath = ["users", 1, 2]',
        shouldPass: false,
      },
      {
        description: "空配列はエラーになること",
        code: "const p: IndexedPath = []",
        shouldPass: false,
      },
    ],
  },
  // オブジェクト型 Level 2
  {
    id: "object-types-2-01",
    category: "object-types",
    level: 2,
    difficulty: "easy",
    promptJa:
      "次の条件を満たすAppConfig型を定義してください。\n- apiUrl: string（必須・読み取り専用）\n- timeout: number（省略可能・変更可能）\n- retries: number（省略可能・読み取り専用）",
    starterCode: "type AppConfig = // ここに型を書いてください",
    expectedAnswer:
      "type AppConfig = {\n  readonly apiUrl: string;\n  timeout?: number;\n  readonly retries?: number;\n}",
    hints: [
      "省略可能なプロパティには ? を、読み取り専用のプロパティには readonly を付けます",
      "readonly と ? は同じプロパティに同時に付けられます",
      "readonly retries?: number のように書きます",
    ],
    explanation:
      "readonly と ? はそれぞれ独立した修飾子なので、組み合わせて「省略可能だが、一度設定したら変更できない」プロパティを表現できます。なお readonly は型チェック上の制約で、実行時にオブジェクトを凍結するわけではありません（実行時にも変更を防ぎたい場合は Object.freeze を使います）。",
    tags: ["optional", "readonly", "object type"],
    testCases: [
      {
        description: "apiUrlのみのオブジェクトが代入できること",
        code: 'const c: AppConfig = { apiUrl: "https://example.com" }',
        shouldPass: true,
      },
      {
        description: "apiUrlがないとエラーになること",
        code: "const c: AppConfig = { timeout: 1000 }",
        shouldPass: false,
      },
      {
        description: "apiUrlは変更できないこと",
        code: 'const c: AppConfig = { apiUrl: "https://example.com" }; c.apiUrl = "https://other.com"',
        shouldPass: false,
      },
      {
        description: "timeoutは後から変更できること",
        code: 'const c: AppConfig = { apiUrl: "https://example.com" }; c.timeout = 3000',
        shouldPass: true,
      },
      {
        description: "retriesは変更できないこと",
        code: 'const c: AppConfig = { apiUrl: "https://example.com", retries: 1 }; c.retries = 2',
        shouldPass: false,
      },
    ],
  },
  {
    id: "object-types-2-02",
    category: "object-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "必須のidプロパティ（number）を持ち、それ以外に任意の文字列キーで string または number の値を持てるRow型を定義してください。",
    starterCode: "type Row = // ここに型を書いてください",
    expectedAnswer: "type Row = {\n  id: number;\n  [key: string]: string | number;\n}",
    hints: [
      "Index Signatureと通常のプロパティは同じ型の中に書けます",
      "通常のプロパティの型は、Index Signatureの値の型に代入可能でなければなりません",
      "{ id: number; [key: string]: string | number } と書きます",
    ],
    explanation:
      "Index Signatureと既知のプロパティは併用できますが、既知のプロパティの型はIndex Signatureの値の型と互換である必要があります。例えば { id: number; [key: string]: string } はidがstringに代入できないためエラーになります。そのため値の型を string | number にしています。既知のプロパティ r.id は number として、それ以外のキーは string | number として扱われます。",
    tags: ["index signature", "object type"],
    testCases: [
      {
        description: "idと任意のキーを持つオブジェクトが代入できること",
        code: 'const r: Row = { id: 1, name: "Taro", age: 20 }',
        shouldPass: true,
      },
      {
        description: "idがないとエラーになること",
        code: 'const r: Row = { name: "Taro" }',
        shouldPass: false,
      },
      {
        description: "booleanの値を持つとエラーになること",
        code: "const r: Row = { id: 1, active: true }",
        shouldPass: false,
      },
      {
        description: "idはnumber、その他のキーは string | number として読めること",
        code: "const r: Row = { id: 1 }; const id: number = r.id; const v: string | number = r.anything",
        shouldPass: true,
      },
    ],
  },
  {
    id: "object-types-2-03",
    category: "object-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      '"data-" で始まるキーだけを持ち、値がstringであるDataAttributes型を、Index Signatureを使って定義してください。例: { "data-id": "42", "data-role": "button" }',
    starterCode: "type DataAttributes = // ここに型を書いてください",
    expectedAnswer: "type DataAttributes = {\n  [key: `data-${string}`]: string;\n}",
    hints: [
      "Index Signatureのキーには string や number 以外の型も使えます",
      "キーの型にテンプレートリテラル型を指定できます",
      "[key: `data-${string}`]: string と書きます",
    ],
    explanation:
      "TypeScript 4.4以降、Index Signatureのキーにテンプレートリテラル型（パターンリテラル型）やsymbolを使えるようになりました。[key: `data-${string}`]: string は「data- で始まる任意のキー」だけを許可します。オブジェクトリテラルでパターンに合わないキーを書くと、余剰プロパティとしてエラーになります。Record<`data-${string}`, string> と書いても同じ意味になります。",
    tags: ["index signature", "template literal types"],
    testCases: [
      {
        description: "data- で始まるキーを持つオブジェクトが代入できること",
        code: 'const d: DataAttributes = { "data-id": "42", "data-role": "button" }',
        shouldPass: true,
      },
      {
        description: "data- で始まる任意のキーの値をstringとして読めること",
        code: 'const d: DataAttributes = {}; const v: string = d["data-test"]',
        shouldPass: true,
      },
      {
        description: "値がnumberだとエラーになること",
        code: 'const d: DataAttributes = { "data-id": 42 }',
        shouldPass: false,
      },
      {
        description: "data- で始まらないキーはエラーになること",
        code: 'const d: DataAttributes = { id: "42" }',
        shouldPass: false,
      },
    ],
  },
  // Union/Intersection Level 2
  {
    id: "union-intersection-2-01",
    category: "union-intersection",
    level: 2,
    difficulty: "medium",
    promptJa:
      'kindプロパティで判別する図形のDiscriminated Union型Shapeを定義してください。\n- 円: { kind: "circle"; radius: number }\n- 長方形: { kind: "rect"; width: number; height: number }\n- 三角形: { kind: "triangle"; base: number; height: number }',
    starterCode: "type Shape = // ここに型を書いてください",
    expectedAnswer:
      'type Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "rect"; width: number; height: number }\n  | { kind: "triangle"; base: number; height: number };',
    hints: [
      "それぞれの図形を別々のオブジェクト型として定義し、Union型でつなげます",
      'kindには "circle" のような文字列リテラル型を指定します',
      '{ kind: "circle"; radius: number } | { kind: "rect"; ... } | { kind: "triangle"; ... } の形になります',
    ],
    explanation:
      'Discriminated Union（判別可能なUnion）では、各メンバーが共通のリテラル型プロパティ（ここではkind）を持ちます。switch (s.kind) や if (s.kind === "circle") で分岐すると、TypeScriptはそのブロック内のsを該当するメンバーの型に絞り込むため、s.radius などに安全にアクセスできます。すべてのkindをswitchで網羅すると、戻り値の型がnumberの関数でも「returnが足りない」というエラーになりません。{ kind: string; radius?: number; ... } のような1つの型にまとめる書き方では、この絞り込みが効きません。',
    tags: ["discriminated union", "narrowing"],
    testCases: [
      {
        description: "switchでkindごとに絞り込んで面積を計算できること",
        code: 'function area(s: Shape): number {\n  switch (s.kind) {\n    case "circle":\n      return Math.PI * s.radius ** 2;\n    case "rect":\n      return s.width * s.height;\n    case "triangle":\n      return (s.base * s.height) / 2;\n  }\n}',
        shouldPass: true,
      },
      {
        description: "長方形のオブジェクトが代入できること",
        code: 'const s: Shape = { kind: "rect", width: 10, height: 20 }',
        shouldPass: true,
      },
      {
        description: "円にwidthとheightを指定するとエラーになること",
        code: 'const s: Shape = { kind: "circle", width: 10, height: 20 }',
        shouldPass: false,
      },
      {
        description: "円に絞り込んだ後にwidthへアクセスするとエラーになること",
        code: 'function f(s: Shape) {\n  if (s.kind === "circle") {\n    return s.width;\n  }\n  return 0;\n}',
        shouldPass: false,
      },
    ],
  },
  {
    id: "union-intersection-2-02",
    category: "union-intersection",
    level: 2,
    difficulty: "medium",
    promptJa:
      "switch文の網羅性チェックに使うassertNever関数を定義してください。すべてのケースを処理した後にだけ呼び出せる（処理漏れがあると型エラーになる）ように、引数と戻り値の型にneverを使います。",
    starterCode:
      'type Status = "idle" | "loading" | "success" | "error";\n\n// ここにassertNever関数を書いてください\n',
    expectedAnswer:
      'type Status = "idle" | "loading" | "success" | "error";\n\nfunction assertNever(value: never): never {\n  throw new Error(`Unexpected value: ${value}`);\n}',
    hints: [
      "すべてのケースを処理し終えた変数の型はneverに絞り込まれます",
      "neverには（never以外の）どんな値も代入できません",
      "function assertNever(value: never): never { throw new Error(...) } と書きます",
    ],
    explanation:
      'switch文ですべてのケースを処理すると、defaultに到達した変数の型はneverに絞り込まれます。引数の型をneverにしておけば、Statusに "cancelled" を追加したのにcaseを書き忘れた場合、defaultでの値の型が "cancelled" になり、assertNeverの呼び出しが型エラーになります。戻り値の型をneverにしているのは「この関数は決して正常にreturnしない」ことを表すためで、return assertNever(s) と書いてもnumberなど任意の戻り値の型と矛盾しません。',
    tags: ["never", "exhaustive check", "switch"],
    testCases: [
      {
        description: "全ケースを網羅したswitchのdefaultで呼び出せること",
        code: 'function label(s: Status): string {\n  switch (s) {\n    case "idle": return "待機中";\n    case "loading": return "読み込み中";\n    case "success": return "成功";\n    case "error": return "失敗";\n    default: return assertNever(s);\n  }\n}',
        shouldPass: true,
      },
      {
        description: '"error" のケースが漏れているとエラーになること',
        code: 'function label(s: Status): string {\n  switch (s) {\n    case "idle": return "待機中";\n    case "loading": return "読み込み中";\n    case "success": return "成功";\n    default: return assertNever(s);\n  }\n}',
        shouldPass: false,
      },
      {
        description: "戻り値がneverなので、number を返す関数の中でもreturnできること",
        code: 'function toNumber(v: "a" | "b"): number {\n  if (v === "a") return 1;\n  if (v === "b") return 2;\n  return assertNever(v);\n}',
        shouldPass: true,
      },
      {
        description: "通常の値を渡すとエラーになること",
        code: 'assertNever("idle")',
        shouldPass: false,
      },
    ],
  },
  {
    id: "union-intersection-2-03",
    category: "union-intersection",
    level: 2,
    difficulty: "medium",
    promptJa:
      "処理の成功・失敗を表すジェネリックなDiscriminated Union型Result<T>を定義してください。\n- 成功: { ok: true; value: T }\n- 失敗: { ok: false; error: string }",
    starterCode: "type Result<T> = // ここに型を書いてください",
    expectedAnswer: "type Result<T> = { ok: true; value: T } | { ok: false; error: string };",
    hints: [
      "判別プロパティには文字列だけでなく true / false のリテラル型も使えます",
      "成功と失敗を別々のオブジェクト型にしてUnionでつなげます",
      "{ ok: true; value: T } | { ok: false; error: string } と書きます",
    ],
    explanation:
      "判別プロパティはstringリテラルに限らず、true / false や数値リテラルでも構いません。if (r.ok) で分岐すると、trueのブランチでは { ok: true; value: T }、elseでは { ok: false; error: string } に絞り込まれます。{ ok: boolean; value?: T; error?: string } のような書き方だと「成功なのにerrorを持つ」ような不正な状態を表現できてしまい、valueも常に T | undefined として扱われます。Discriminated Unionを使うと、不正な状態を型レベルで表現不可能にできます。",
    tags: ["discriminated union", "generics", "narrowing"],
    testCases: [
      {
        description: "okで絞り込むとvalue / errorに安全にアクセスできること",
        code: "function unwrap(r: Result<number>): number {\n  if (r.ok) {\n    return r.value;\n  } else {\n    throw new Error(r.error);\n  }\n}",
        shouldPass: true,
      },
      {
        description: "成功のオブジェクトが代入できること",
        code: 'const r: Result<string> = { ok: true, value: "done" }',
        shouldPass: true,
      },
      {
        description: "成功なのにerrorを持つとエラーになること",
        code: 'const r: Result<number> = { ok: true, error: "failed" }',
        shouldPass: false,
      },
      {
        description: "valueの型がTと異なるとエラーになること",
        code: "const r: Result<string> = { ok: true, value: 1 }",
        shouldPass: false,
      },
      {
        description: "絞り込まずにvalueへアクセスするとエラーになること",
        code: "function f(r: Result<number>) {\n  return r.value;\n}",
        shouldPass: false,
      },
    ],
  },
  // 関数型 Level 2
  {
    id: "function-types-2-01",
    category: "function-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "関数convertにオーバーロードシグネチャを追加してください。stringを渡したときは戻り値がnumber、numberを渡したときは戻り値がstringになるようにします。実装シグネチャは変更しなくて構いません。",
    starterCode:
      '// ここにオーバーロードシグネチャを書いてください\nfunction convert(input: string | number): string | number {\n  return typeof input === "string" ? Number(input) : String(input);\n}',
    expectedAnswer:
      'function convert(input: string): number;\nfunction convert(input: number): string;\nfunction convert(input: string | number): string | number {\n  return typeof input === "string" ? Number(input) : String(input);\n}',
    hints: [
      "オーバーロードは、本体を持たない関数シグネチャを実装の直前に並べて書きます",
      "呼び出し側から見えるのはオーバーロードシグネチャだけで、実装シグネチャは見えません",
      "function convert(input: string): number; と function convert(input: number): string; を実装の上に書きます",
    ],
    explanation:
      "関数オーバーロードでは、本体を持たないシグネチャを複数並べ、最後に実装を書きます。呼び出し時は上から順にシグネチャが照合され、最初にマッチしたものの戻り値の型が使われます。実装シグネチャ（string | number を受け取る本体付きの宣言）は外部から直接呼び出せないため、string | number 型の値をそのまま渡すとエラーになる点に注意しましょう。そのような呼び出しも許可したい場合は、3つ目のオーバーロードを追加します。",
    tags: ["overload", "function"],
    testCases: [
      {
        description: "stringを渡すとnumberが返ること",
        code: 'const n: number = convert("42")',
        shouldPass: true,
      },
      {
        description: "numberを渡すとstringが返ること",
        code: "const s: string = convert(42)",
        shouldPass: true,
      },
      {
        description: "stringを渡した戻り値はstringとして扱えないこと",
        code: 'const s: string = convert("42")',
        shouldPass: false,
      },
      {
        description: "booleanは渡せないこと",
        code: "convert(true)",
        shouldPass: false,
      },
    ],
  },
  {
    id: "function-types-2-02",
    category: "function-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "配列の先頭要素を返す関数firstを、ジェネリクスを使って書き換えてください。要素の型を保ったまま、空配列の場合を考慮して戻り値の型は「要素の型 | undefined」にします。",
    starterCode:
      "// anyを使わず、ジェネリクスで型を付けてください\nfunction first(arr: any[]): any {\n  return arr[0];\n}",
    expectedAnswer: "function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}",
    hints: [
      "関数名の後ろに <T> と書くと型パラメータを宣言できます",
      "引数の配列の型を T[] にすると、呼び出し時に要素の型からTが推論されます",
      "function first<T>(arr: T[]): T | undefined と書きます",
    ],
    explanation:
      "ジェネリック関数では、呼び出し時の引数から型パラメータが推論されます。first([1, 2, 3]) ではTがnumberと推論され、戻り値は number | undefined になります。anyを使うと戻り値に何でも代入できてしまい、型の情報が失われます。なお strict モードでも配列のインデックスアクセス arr[0] の型は T になるため（noUncheckedIndexedAccess が無効な場合）、空配列の可能性を戻り値の型で明示しておくと安全です。",
    tags: ["generics", "generic function", "inference"],
    testCases: [
      {
        description: "number[]を渡すと number | undefined が返ること",
        code: "const n: number | undefined = first([1, 2, 3])",
        shouldPass: true,
      },
      {
        description: "string[]を渡すと string | undefined が返ること",
        code: 'const s: string | undefined = first(["a", "b"])',
        shouldPass: true,
      },
      {
        description: "number[]の戻り値をstringとして扱えないこと",
        code: "const s: string | undefined = first([1, 2])",
        shouldPass: false,
      },
      {
        description: "undefinedの可能性があるのでnumber型には代入できないこと",
        code: "const n: number = first([1, 2])",
        shouldPass: false,
      },
    ],
  },
  {
    id: "function-types-2-03",
    category: "function-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "配列と変換関数を受け取り、各要素を変換した新しい配列を返す関数mapArrayに型を付けてください。入力の要素の型をT、変換後の型をUとする2つの型パラメータを使います。",
    starterCode:
      "// anyを使わず、ジェネリクスで型を付けてください\nfunction mapArray(arr: any[], fn: (item: any) => any): any[] {\n  return arr.map(fn);\n}",
    expectedAnswer: "function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] {\n  return arr.map(fn);\n}",
    hints: [
      "型パラメータは <T, U> のように複数宣言できます",
      "コールバックの引数の型にTを、戻り値の型にUを使います",
      "function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] と書きます",
    ],
    explanation:
      "型パラメータTは引数arrから、Uはコールバックの戻り値から推論されます。mapArray([1, 2], n => n.toFixed()) では、まずTがnumberと推論され、それがコールバックの引数nの型として使われる（文脈的型付け）ため、nに型注釈を書かなくてもtoFixedを呼べます。その後コールバックの戻り値からUがstringと推論され、戻り値はstring[]になります。",
    tags: ["generics", "generic function", "callback"],
    testCases: [
      {
        description: "number[]をstring[]に変換でき、コールバックの引数がnumberと推論されること",
        code: "const r: string[] = mapArray([1, 2], (n) => n.toFixed())",
        shouldPass: true,
      },
      {
        description: "string[]をnumber[]に変換できること",
        code: 'const r: number[] = mapArray(["a", "bb"], (s) => s.length)',
        shouldPass: true,
      },
      {
        description: "戻り値の型がコールバックの戻り値と一致しないとエラーになること",
        code: "const r: number[] = mapArray([1, 2], (n) => String(n))",
        shouldPass: false,
      },
      {
        description: "コールバックの引数の型が配列の要素と合わないとエラーになること",
        code: "mapArray([1, 2], (s: string) => s.length)",
        shouldPass: false,
      },
    ],
  },
  // ジェネリクス Level 2
  {
    id: "generics-2-01",
    category: "generics",
    level: 2,
    difficulty: "medium",
    promptJa:
      "2つの値のうちlengthが長い方を返す関数longestが型エラーになっています。型パラメータTに「lengthプロパティ（number）を持つ」という制約を追加して、エラーを解消してください。",
    starterCode:
      "// Tに制約を追加してください\nfunction longest<T>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}",
    expectedAnswer:
      "function longest<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}",
    hints: [
      "制約のない型パラメータTには、どんなプロパティがあるか分かりません",
      "extendsを使うと型パラメータに制約を付けられます",
      "<T extends { length: number }> と書きます",
    ],
    explanation:
      "制約のない型パラメータTは「どんな型でもよい」ため、a.length のようなプロパティアクセスは許可されません。T extends { length: number } と制約を付けると、Tは少なくともlengthを持つ型に限定され、関数内でlengthを安全に使えます。構造的型付けにより、string・配列・{ length: number } を持つ任意のオブジェクトを渡せますが、numberのようにlengthを持たない値はエラーになります。",
    tags: ["generics", "constraints", "extends"],
    testCases: [
      {
        description: "文字列同士を渡せること",
        code: 'const s: string = longest("apple", "banana")',
        shouldPass: true,
      },
      {
        description: "配列同士を渡すと配列型が返ること",
        code: "const arr: number[] = longest([1, 2], [3])",
        shouldPass: true,
      },
      {
        description: "lengthを持たないnumberは渡せないこと",
        code: "longest(10, 20)",
        shouldPass: false,
      },
      {
        description: "配列を渡した戻り値はstringとして扱えないこと",
        code: "const s: string = longest([1], [2])",
        shouldPass: false,
      },
    ],
  },
  {
    id: "generics-2-02",
    category: "generics",
    level: 2,
    difficulty: "medium",
    promptJa:
      "オブジェクトとキーを受け取り、そのプロパティの値を返す関数getPropertyに型を付けてください。存在しないキーはエラーにし、戻り値はそのキーに対応するプロパティの型にします。",
    starterCode:
      "// anyを使わず、ジェネリクスで型を付けてください\nfunction getProperty(obj: any, key: string): any {\n  return obj[key];\n}",
    expectedAnswer: "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}",
    hints: [
      "オブジェクトの型をT、キーの型をKとする2つの型パラメータを使います",
      "keyof T でTのキーのUnion型が得られ、K extends keyof T で制約できます",
      "戻り値の型にはインデックスアクセス型 T[K] を使います",
    ],
    explanation:
      'K extends keyof T という制約により、keyにはobjに実在するキーしか渡せなくなります。戻り値の型を T[K] にすると、getProperty(user, "age") では K が "age" と推論されるため戻り値は number になります。戻り値を T[keyof T] にしてしまうと、すべてのプロパティの型のUnion（string | number など）になり、正確な型が得られません。',
    tags: ["generics", "keyof", "constraints", "indexed access"],
    testCases: [
      {
        description: "ageを指定するとnumberが返ること",
        code: 'const user = { name: "Taro", age: 20 };\nconst age: number = getProperty(user, "age")',
        shouldPass: true,
      },
      {
        description: "nameを指定するとstringが返ること",
        code: 'const user = { name: "Taro", age: 20 };\nconst name2: string = getProperty(user, "name")',
        shouldPass: true,
      },
      {
        description: "存在しないキーはエラーになること",
        code: 'const user = { name: "Taro", age: 20 };\ngetProperty(user, "email")',
        shouldPass: false,
      },
      {
        description: "ageの戻り値をstringとして扱えないこと",
        code: 'const user = { name: "Taro", age: 20 };\nconst age: string = getProperty(user, "age")',
        shouldPass: false,
      },
    ],
  },
  {
    id: "generics-2-03",
    category: "generics",
    level: 2,
    difficulty: "medium",
    promptJa:
      "ページネーション結果を表す型Paginated<T, M>を修正してください。メタ情報の型パラメータMに「objectであること」という制約と、デフォルト型 { page: number } を設定し、Paginated<string> のように1つの型引数だけでも使えるようにします。",
    starterCode: "// Mに制約とデフォルト型を追加してください\ntype Paginated<T, M> = {\n  items: T[];\n  meta: M;\n};",
    expectedAnswer: "type Paginated<T, M extends object = { page: number }> = {\n  items: T[];\n  meta: M;\n};",
    hints: [
      "型パラメータには制約（extends）とデフォルト型（=）を同時に指定できます",
      "書く順番は「制約 → デフォルト型」です",
      "M extends object = { page: number } と書きます",
    ],
    explanation:
      "型パラメータには <M extends 制約 = デフォルト型> の形で制約とデフォルトを同時に指定できます。デフォルト型は制約を満たしている必要があります。デフォルト型を持つ型パラメータは省略可能になりますが、省略可能な型パラメータの後ろに必須の型パラメータを置くことはできないため、デフォルトを持つものは後ろに並べます。Paginated<string> は Paginated<string, { page: number }> と同じ意味になり、Paginated<string, string> は制約違反でエラーになります。",
    tags: ["generics", "default type", "constraints"],
    testCases: [
      {
        description: "型引数1つで使え、metaはデフォルトの { page: number } になること",
        code: 'const p: Paginated<string> = { items: ["a", "b"], meta: { page: 1 } }',
        shouldPass: true,
      },
      {
        description: "Mを明示的に指定できること",
        code: 'const p: Paginated<number, { cursor: string }> = { items: [1], meta: { cursor: "abc" } }',
        shouldPass: true,
      },
      {
        description: "デフォルトのmetaにcursorを渡すとエラーになること",
        code: 'const p: Paginated<string> = { items: ["a"], meta: { cursor: "abc" } }',
        shouldPass: false,
      },
      {
        description: "Mにstringを指定すると制約違反でエラーになること",
        code: "type P = Paginated<string, string>",
        shouldPass: false,
      },
    ],
  },
  // ユーティリティ型 Level 2
  {
    id: "utility-types-2-01",
    category: "utility-types",
    level: 2,
    difficulty: "easy",
    promptJa:
      "Role型のすべてのロールをキーに持ち、値がそのロールの権限名の配列（string[]）であるRolePermissions型を、Recordを使って定義してください。",
    starterCode:
      'type Role = "admin" | "editor" | "viewer";\n\ntype RolePermissions = // ここにRecordを使って書いてください',
    expectedAnswer: 'type Role = "admin" | "editor" | "viewer";\n\ntype RolePermissions = Record<Role, string[]>;',
    hints: [
      "Record<K, V> はキーの型Kと値の型Vからオブジェクト型を作ります",
      "Kに文字列リテラルのUnion型を渡すと、そのすべてのキーが必須になります",
      "Record<Role, string[]> と書きます",
    ],
    explanation:
      "Record<K, V> は { [P in K]: V } というMapped Typeで定義されたユーティリティ型です。Kに Role のようなリテラル型のUnionを渡すと、すべてのロールが必須キーになるため、ロールを追加したときに設定漏れをコンパイルエラーで検出できます。Record<string, string[]> にするとキーの網羅性はチェックされず、存在しないロールも書けてしまいます。",
    tags: ["utility types", "Record"],
    testCases: [
      {
        description: "すべてのロールを持つオブジェクトが代入できること",
        code: 'const p: RolePermissions = { admin: ["read", "write", "delete"], editor: ["read", "write"], viewer: ["read"] }',
        shouldPass: true,
      },
      {
        description: "viewerが欠けているとエラーになること",
        code: 'const p: RolePermissions = { admin: ["read"], editor: ["read"] }',
        shouldPass: false,
      },
      {
        description: "存在しないロールを含むとエラーになること",
        code: "const p: RolePermissions = { admin: [], editor: [], viewer: [], guest: [] }",
        shouldPass: false,
      },
      {
        description: "値が配列でないとエラーになること",
        code: 'const p: RolePermissions = { admin: "all", editor: [], viewer: [] }',
        shouldPass: false,
      },
    ],
  },
  {
    id: "utility-types-2-02",
    category: "utility-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      'Action型から、次の2つの型を定義してください。\n- RemoveAction: type が "remove" のメンバーだけを取り出した型（Extractを使用）\n- WithoutReset: type が "reset" のメンバーを取り除いた型（Excludeを使用）',
    starterCode:
      'type Action =\n  | { type: "add"; payload: number }\n  | { type: "remove"; id: string }\n  | { type: "reset" };\n\ntype RemoveAction = // ここにExtractを使って書いてください\ntype WithoutReset = // ここにExcludeを使って書いてください',
    expectedAnswer:
      'type Action =\n  | { type: "add"; payload: number }\n  | { type: "remove"; id: string }\n  | { type: "reset" };\n\ntype RemoveAction = Extract<Action, { type: "remove" }>;\ntype WithoutReset = Exclude<Action, { type: "reset" }>;',
    hints: [
      "Extract<T, U> はTのUnionメンバーのうちUに代入可能なものを残し、Exclude<T, U> は取り除きます",
      '第2引数には { type: "remove" } のような「条件となる形」を渡せます',
      'Extract<Action, { type: "remove" }> と Exclude<Action, { type: "reset" }> と書きます',
    ],
    explanation:
      'Extract<T, U> は T extends U ? T : never、Exclude<T, U> は T extends U ? never : T という分配条件型で定義されています。TがUnion型の場合、メンバーごとに判定されるため、{ type: "remove" } に代入可能なメンバー（{ type: "remove"; id: string }）だけを残したり除いたりできます。Discriminated Unionから特定のメンバーを取り出すときの定番パターンです。',
    tags: ["utility types", "Extract", "Exclude", "union"],
    testCases: [
      {
        description: 'RemoveActionが { type: "remove"; id: string } と一致すること',
        code: EQUAL + 'const check: Equal<RemoveAction, { type: "remove"; id: string }> = true',
        shouldPass: true,
      },
      {
        description: "WithoutResetがaddとremoveのUnion型と一致すること",
        code:
          EQUAL +
          'const check: Equal<WithoutReset, { type: "add"; payload: number } | { type: "remove"; id: string }> = true',
        shouldPass: true,
      },
      {
        description: "WithoutResetにresetアクションは代入できないこと",
        code: 'const a: WithoutReset = { type: "reset" }',
        shouldPass: false,
      },
      {
        description: "RemoveActionにaddアクションは代入できないこと",
        code: 'const a: RemoveAction = { type: "add", payload: 1 }',
        shouldPass: false,
      },
    ],
  },
  {
    id: "utility-types-2-03",
    category: "utility-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      'Settings型のthemeプロパティの型から、null と undefined を取り除いたTheme型（"light" | "dark"）を、インデックスアクセス型とNonNullableを使って定義してください。',
    starterCode:
      'type Settings = {\n  theme?: "light" | "dark" | null;\n  fontSize?: number | null;\n};\n\ntype Theme = // ここにNonNullableを使って書いてください',
    expectedAnswer:
      'type Settings = {\n  theme?: "light" | "dark" | null;\n  fontSize?: number | null;\n};\n\ntype Theme = NonNullable<Settings["theme"]>;',
    hints: [
      'Settings["theme"] でプロパティの型を取り出せます',
      "オプショナルプロパティの型には undefined も含まれます",
      'NonNullable<Settings["theme"]> と書きます',
    ],
    explanation:
      'Settings["theme"] の型は "light" | "dark" | null | undefined です。?を付けたオプショナルプロパティは、インデックスアクセスで取り出すと undefined も含む点に注意しましょう。NonNullable<T> は T & {} として定義されており、null と undefined の両方を取り除きます。Exclude<Settings["theme"], null> だけでは undefined が残ってしまいます。',
    tags: ["utility types", "NonNullable", "indexed access"],
    testCases: [
      {
        description: 'Themeが "light" | "dark" と一致すること',
        code: EQUAL + 'const check: Equal<Theme, "light" | "dark"> = true',
        shouldPass: true,
      },
      {
        description: '"dark" が代入できること',
        code: 'const t: Theme = "dark"',
        shouldPass: true,
      },
      {
        description: "nullは代入できないこと",
        code: "const t: Theme = null",
        shouldPass: false,
      },
      {
        description: "undefinedは代入できないこと",
        code: "const t: Theme = undefined",
        shouldPass: false,
      },
    ],
  },
  // 条件型 Level 2
  {
    id: "conditional-types-2-01",
    category: "conditional-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "Union型の各メンバーをそれぞれ配列型に変換するToArray<T>型を、分配条件型を使って定義してください。例: ToArray<string | number> は string[] | number[] になります（(string | number)[] ではありません）。",
    starterCode: "type ToArray<T> = // ここに型を書いてください",
    expectedAnswer: "type ToArray<T> = T extends unknown ? T[] : never;",
    hints: [
      "型パラメータTをそのまま extends の左側に置いた条件型は、Union型に対して分配されます",
      "条件は常に真になるもの（T extends unknown や T extends any）で構いません",
      "T extends unknown ? T[] : never と書きます",
    ],
    explanation:
      "条件型のチェック対象が裸の型パラメータ（T extends ...）の場合、TにUnion型を渡すと各メンバーごとに条件型が適用され、結果がUnionで結合されます（分配条件型）。そのため ToArray<string | number> は ToArray<string> | ToArray<number>、つまり string[] | number[] になります。単に T[] と書くと (string | number)[] となり、文字列と数値が混在した配列も許容してしまいます。また、neverは「空のUnion」として扱われるため、ToArray<never> は never になります。",
    tags: ["conditional types", "distributive", "union"],
    testCases: [
      {
        description: "ToArray<string | number> が string[] | number[] と一致すること",
        code: EQUAL + "const check: Equal<ToArray<string | number>, string[] | number[]> = true",
        shouldPass: true,
      },
      {
        description: "数値だけの配列が代入できること",
        code: "const a: ToArray<string | number> = [1, 2, 3]",
        shouldPass: true,
      },
      {
        description: "文字列と数値が混在した配列は代入できないこと",
        code: 'const a: ToArray<string | number> = ["a", 1]',
        shouldPass: false,
      },
      {
        description: "ToArray<never> が never になること",
        code: EQUAL + "const check: Equal<ToArray<never>, never> = true",
        shouldPass: true,
      },
    ],
  },
  {
    id: "conditional-types-2-02",
    category: "conditional-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "Tがneverならtrue、そうでなければfalseを返すIsNever<T>型を定義してください。単純に T extends never ? true : false と書くとうまくいかない理由も考えてみましょう。",
    starterCode: "type IsNever<T> = // ここに型を書いてください",
    expectedAnswer: "type IsNever<T> = [T] extends [never] ? true : false;",
    hints: [
      "T extends never ? ... と書くと、IsNever<never> の結果は true ではなく never になります",
      "分配条件型は、neverを「メンバーが0個のUnion」として扱います",
      "[T] extends [never] のようにタプルで包むと分配を止められます",
    ],
    explanation:
      "裸の型パラメータを使った条件型は分配されます。neverはメンバーが0個のUnionとみなされるため、分配の結果も never になり、T extends never ? true : false に never を渡すと true ではなく never が返ります。[T] extends [never] のようにタプル（や配列など別の型）で包むと、チェック対象が裸の型パラメータではなくなるため分配が起こらず、T全体を1つの型として判定できます。",
    tags: ["conditional types", "never", "distributive"],
    testCases: [
      {
        description: "IsNever<never> が true になること",
        code: EQUAL + "const check: Equal<IsNever<never>, true> = true",
        shouldPass: true,
      },
      {
        description: "IsNever<string> が false になること",
        code: EQUAL + "const check: Equal<IsNever<string>, false> = true",
        shouldPass: true,
      },
      {
        description: "IsNever<undefined> が false になること",
        code: EQUAL + "const check: Equal<IsNever<undefined>, false> = true",
        shouldPass: true,
      },
      {
        description: "IsNever<never> に false は代入できないこと",
        code: "const x: IsNever<never> = false",
        shouldPass: false,
      },
    ],
  },
  {
    id: "conditional-types-2-03",
    category: "conditional-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "関数型Fの第1引数の型を取り出すFirstArg<F>型を、inferを使って定義してください。Fが関数型でない場合はneverを返します。",
    starterCode: "type FirstArg<F> = // ここに型を書いてください",
    expectedAnswer: "type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;",
    hints: [
      "条件型の extends の右側で infer を使うと、その位置の型を取り出せます",
      "関数型のパターンは (引数) => 戻り値 の形で書き、残りの引数は ...rest: any[] で受け止めます",
      "F extends (first: infer A, ...rest: any[]) => any ? A : never と書きます",
    ],
    explanation:
      "infer は条件型の extends 節の中でのみ使え、パターンにマッチした位置の型を新しい型変数として取り出します。(first: infer A, ...rest: any[]) => any は「第1引数と任意個の残りの引数を持つ関数」にマッチし、第1引数の型がAに束縛されます。標準の Parameters<F> も同じ仕組みで (...args: infer P) => any として定義されており、Parameters<F>[0] でも第1引数を取り出せます（ただしParametersはFに関数型の制約があります）。",
    tags: ["conditional types", "infer", "function"],
    testCases: [
      {
        description: "(a: string, b: number) => void から string が取り出せること",
        code: EQUAL + "const check: Equal<FirstArg<(a: string, b: number) => void>, string> = true",
        shouldPass: true,
      },
      {
        description: "オブジェクト型の引数も取り出せること",
        code: EQUAL + "const check: Equal<FirstArg<(user: { id: number }) => boolean>, { id: number }> = true",
        shouldPass: true,
      },
      {
        description: "関数型でなければ never になること",
        code: EQUAL + "const check: Equal<FirstArg<string>, never> = true",
        shouldPass: true,
      },
      {
        description: "第1引数がnumberの関数からは string を取り出せないこと",
        code: 'const x: FirstArg<(n: number) => void> = "a"',
        shouldPass: false,
      },
    ],
  },
  // Mapped Types Level 2
  {
    id: "mapped-types-2-01",
    category: "mapped-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "オブジェクト型Tの各プロパティについて、「get + 先頭を大文字にしたキー名」という名前で、そのプロパティの値を返す関数を持つGetters<T>型を定義してください。例: Getters<{ name: string }> は { getName: () => string } になります。",
    starterCode: "type Getters<T> = // ここに型を書いてください",
    expectedAnswer: "type Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};",
    hints: [
      "Mapped Typeの [K in keyof T as 新しいキー] でキー名を変換できます（Key Remapping）",
      "テンプレートリテラル型と組み込みの Capitalize<S> を組み合わせます",
      "keyof T には symbol なども含まれるため、string & K でstringに絞ってから Capitalize に渡します",
    ],
    explanation:
      'TypeScript 4.1で追加された as 句（Key Remapping）を使うと、Mapped Typeでキー名を別の型に変換できます。`get${Capitalize<string & K>}` は、キー "name" を "getName" に変換します。keyof T は string | number | symbol のいずれかになり得るため、Capitalize（stringを要求する）に渡す前に string & K でstringのキーに限定しています（symbolキーは never になり除外されます）。値の型では、元のキーKを使って T[K] を参照できます。',
    tags: ["mapped types", "key remapping", "template literal types"],
    testCases: [
      {
        description: "Getters<{ name: string; age: number }> が期待する型と一致すること",
        code:
          EQUAL +
          "const check: Equal<Getters<{ name: string; age: number }>, { getName: () => string; getAge: () => number }> = true",
        shouldPass: true,
      },
      {
        description: "getTitleを持つオブジェクトが代入できること",
        code: 'const g: Getters<{ title: string }> = { getTitle: () => "TypeScript" }',
        shouldPass: true,
      },
      {
        description: "元のキー名のままではエラーになること",
        code: 'const g: Getters<{ title: string }> = { title: () => "TypeScript" }',
        shouldPass: false,
      },
      {
        description: "戻り値の型が異なるとエラーになること",
        code: 'const g: Getters<{ count: number }> = { getCount: () => "1" }',
        shouldPass: false,
      },
    ],
  },
  {
    id: "mapped-types-2-02",
    category: "mapped-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "オブジェクト型Tから、値の型がVに代入可能なプロパティだけを残すPickByValue<T, V>型を定義してください。例: PickByValue<{ a: string; b: number; c: string }, string> は { a: string; c: string } になります。",
    starterCode: "type PickByValue<T, V> = // ここに型を書いてください",
    expectedAnswer: "type PickByValue<T, V> = {\n  [K in keyof T as T[K] extends V ? K : never]: T[K];\n};",
    hints: [
      "as 句でキーを never に変換すると、そのプロパティは結果から除外されます",
      "as 句の中でも条件型を使えます",
      "[K in keyof T as T[K] extends V ? K : never]: T[K] と書きます",
    ],
    explanation:
      "Key Remappingの as 句でキーを never にすると、そのプロパティは生成されません。これを条件型と組み合わせると「値の型に応じてプロパティを取捨選択する」ことができます。{ [K in keyof T]: T[K] extends V ? T[K] : never } のように値の側で判定すると、キー自体は残ったまま値が never になるだけなので、プロパティの除外にはなりません。",
    tags: ["mapped types", "key remapping", "conditional types"],
    testCases: [
      {
        description: "stringのプロパティだけが残ること",
        code:
          EQUAL +
          "const check: Equal<PickByValue<{ a: string; b: number; c: string }, string>, { a: string; c: string }> = true",
        shouldPass: true,
      },
      {
        description: "Vにunion型を指定できること",
        code:
          EQUAL +
          "const check: Equal<PickByValue<{ a: string; b: number; c: boolean }, string | number>, { a: string; b: number }> = true",
        shouldPass: true,
      },
      {
        description: "リテラル型の値もVに代入可能なら残ること",
        code:
          EQUAL + 'const check: Equal<PickByValue<{ id: 1; name: "Taro"; tags: string[] }, number>, { id: 1 }> = true',
        shouldPass: true,
      },
      {
        description: "除外されたプロパティを含むとエラーになること",
        code: 'const r: PickByValue<{ a: string; b: number }, string> = { a: "x", b: 1 }',
        shouldPass: false,
      },
    ],
  },
  {
    id: "mapped-types-2-03",
    category: "mapped-types",
    level: 2,
    difficulty: "medium",
    promptJa:
      "as 句によるKey Remappingを使って、オブジェクト型TからキーKを取り除くMyOmit<T, K>型を定義してください（Omitの再実装）。KはTのキーに制約し、元のプロパティの ? や readonly は保持されるようにします。",
    starterCode: "type MyOmit<T, K extends keyof T> = // ここに型を書いてください",
    expectedAnswer: "type MyOmit<T, K extends keyof T> = {\n  [P in keyof T as Exclude<P, K>]: T[P];\n};",
    hints: [
      "keyof T の各キーPを as 句で変換し、Kに含まれるキーだけを never にします",
      "Exclude<P, K> は、PがKに含まれれば never、そうでなければPを返します",
      "[P in keyof T as Exclude<P, K>]: T[P] と書きます",
    ],
    explanation:
      "{ [P in keyof T]: T[P] } の形（準同型Mapped Type）は、元のプロパティの ? や readonly といった修飾子を保持します。as 句でキーを変換しても in keyof T の形を保っているため、修飾子はそのまま引き継がれます。一方 { [P in Exclude<keyof T, K>]: T[P] } と書くと、反復対象が keyof T ではなくなるため修飾子が失われます（標準のOmitは Pick<T, Exclude<keyof T, K>> として定義されており、Pickを経由することで修飾子を保持しています）。",
    tags: ["mapped types", "key remapping", "Omit"],
    testCases: [
      {
        description: "指定したキーが取り除かれること",
        code:
          EQUAL +
          'const check: Equal<MyOmit<{ a: string; b: number; c: boolean }, "a">, { b: number; c: boolean }> = true',
        shouldPass: true,
      },
      {
        description: "? と readonly が保持されること",
        code:
          EQUAL +
          'const check: Equal<MyOmit<{ a: string; b?: number; readonly c: boolean }, "a">, { b?: number; readonly c: boolean }> = true',
        shouldPass: true,
      },
      {
        description: "存在しないキーを指定するとエラーになること",
        code: 'type R = MyOmit<{ a: string }, "z">',
        shouldPass: false,
      },
      {
        description: "取り除いたキーを含むオブジェクトはエラーになること",
        code: 'const r: MyOmit<{ a: string; b: number }, "a"> = { a: "x", b: 1 }',
        shouldPass: false,
      },
    ],
  },
  // 型パズル Level 2
  {
    id: "advanced-patterns-2-01",
    category: "advanced-patterns",
    level: 2,
    difficulty: "medium",
    promptJa:
      "satisfies演算子を使って、paletteの各値が Color 型（RGBのタプル、または文字列）であることをチェックしてください。ただしpaletteの型は Record<string, Color> に広げず、primaryはタプル型 [number, number, number]、secondaryはstring型として扱えるようにします。",
    starterCode:
      'type Color = [number, number, number] | string;\n\n// satisfiesを使って、値が Record<string, Color> を満たすことをチェックしてください\nconst palette = {\n  primary: [255, 0, 0],\n  secondary: "#00ff00",\n};',
    expectedAnswer:
      'type Color = [number, number, number] | string;\n\nconst palette = {\n  primary: [255, 0, 0],\n  secondary: "#00ff00",\n} satisfies Record<string, Color>;',
    hints: [
      "型注釈 const palette: Record<string, Color> にすると、各プロパティの型が Color に広がってしまいます",
      "satisfies はチェックだけを行い、式から推論された型を保持します。さらに、satisfies の型は推論時の「文脈」としても使われます",
      "オブジェクトリテラルの後ろに satisfies Record<string, Color> と書きます",
    ],
    explanation:
      "satisfies は「値が型を満たすか」をチェックしつつ、変数の型としては式から推論された型を使います。型注釈 Record<string, Color> を付けると palette.secondary は Color（タプル | string）になりstringのメソッドを直接呼べず、存在しないキーへのアクセスもエラーになりません。また satisfies を付けない場合、[255, 0, 0] は number[] と推論されます。satisfies Record<string, Color> を付けると、その型が文脈的型付けにも使われるため、配列リテラルがタプル型 [number, number, number] として推論されます。as const とは異なり、readonlyにはならないので要素の変更も可能です。",
    tags: ["satisfies", "contextual typing", "tuple"],
    testCases: [
      {
        description: "secondaryをstringとして扱えること",
        code: "const upper: string = palette.secondary.toUpperCase()",
        shouldPass: true,
      },
      {
        description: "primaryが長さ3のタプルとして推論され、4番目の要素にアクセスするとエラーになること",
        code: "const alpha = palette.primary[3]",
        shouldPass: false,
      },
      {
        description: "primaryの要素は変更できること（readonlyではない）",
        code: "palette.primary[0] = 128",
        shouldPass: true,
      },
      {
        description: "存在しないキーにアクセスするとエラーになること",
        code: "const t = palette.tertiary",
        shouldPass: false,
      },
    ],
  },
  {
    id: "advanced-patterns-2-02",
    category: "advanced-patterns",
    level: 2,
    difficulty: "medium",
    promptJa:
      "HTTP_STATUSオブジェクトに const アサーションを付けて値をリテラル型として固定し、その値のUnion型 HttpStatusCode（200 | 201 | 404）を定義してください。",
    starterCode:
      "// as const を付けてください\nconst HTTP_STATUS = {\n  OK: 200,\n  CREATED: 201,\n  NOT_FOUND: 404,\n};\n\ntype HttpStatusCode = // ここに型を書いてください",
    expectedAnswer:
      "const HTTP_STATUS = {\n  OK: 200,\n  CREATED: 201,\n  NOT_FOUND: 404,\n} as const;\n\ntype HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];",
    hints: [
      "as const がないと、プロパティの型は 200 ではなく number に広がります",
      "typeof HTTP_STATUS でオブジェクトの型、keyof typeof HTTP_STATUS でキーのUnion型が得られます",
      "(typeof HTTP_STATUS)[keyof typeof HTTP_STATUS] で値の型のUnionを取り出せます",
    ],
    explanation:
      "as const（constアサーション）を付けると、オブジェクトリテラルの各プロパティが readonly になり、値の型もリテラル型（200 など）のまま保持されます。付けない場合、プロパティは再代入可能なので型は number に広がります。T[keyof T] は「すべてのキーでインデックスアクセスした型のUnion」なので、(typeof HTTP_STATUS)[keyof typeof HTTP_STATUS] は 200 | 201 | 404 になります。enumの代わりによく使われるパターンです。",
    tags: ["as const", "typeof", "keyof", "indexed access"],
    testCases: [
      {
        description: "HttpStatusCodeが 200 | 201 | 404 と一致すること",
        code: EQUAL + "const check: Equal<HttpStatusCode, 200 | 201 | 404> = true",
        shouldPass: true,
      },
      {
        description: "定義されていない 500 は代入できないこと",
        code: "const code: HttpStatusCode = 500",
        shouldPass: false,
      },
      {
        description: "HTTP_STATUS.OK がリテラル型 200 を持つこと",
        code: "const ok: 200 = HTTP_STATUS.OK",
        shouldPass: true,
      },
      {
        description: "HTTP_STATUSのプロパティは変更できないこと",
        code: "HTTP_STATUS.OK = 999",
        shouldPass: false,
      },
    ],
  },
  {
    id: "advanced-patterns-2-03",
    category: "advanced-patterns",
    level: 2,
    difficulty: "medium",
    promptJa:
      "declare global を使って、グローバルな型を拡張してください。\n- Window インターフェースに appVersion: string を追加\n- Array<T> インターフェースに、最後の要素（空なら undefined）を返す last(): T | undefined メソッドを追加\n（型定義のみでよく、実装は不要です）",
    starterCode: "export {};\n\ndeclare global {\n  // ここにWindowとArray<T>の拡張を書いてください\n}",
    expectedAnswer:
      "export {};\n\ndeclare global {\n  interface Window {\n    appVersion: string;\n  }\n\n  interface Array<T> {\n    last(): T | undefined;\n  }\n}",
    hints: [
      "interfaceは同じ名前で再度宣言すると、既存の宣言にマージされます（Declaration Merging）",
      "declare global { } の中に書いたinterfaceは、グローバルスコープの型にマージされます",
      "Array を拡張するときは、標準の宣言と同じ型パラメータ名 T を使って interface Array<T> { ... } と書きます",
    ],
    explanation:
      "interfaceは同名の宣言を自動的にマージするため、既存の型に後からプロパティを追加できます（Declaration Merging）。import/exportを含むファイルはモジュールとして扱われ、その中の宣言はファイルローカルになるため、グローバルな Window や Array を拡張するには declare global ブロックを使います（export {} はこのファイルをモジュールにするための記述です）。Array<T> をマージする場合、すべての宣言で型パラメータが同一である必要があるため、標準の lib と同じ T を使います。なお型を追加しただけでは実行時のメソッドは存在しないため、実際には Array.prototype.last の実装も別途必要です。",
    tags: ["declare global", "declaration merging", "module augmentation"],
    testCases: [
      {
        description: "window.appVersion を string として読めること",
        code: "const v: string = window.appVersion",
        shouldPass: true,
      },
      {
        description: "window.appVersion に数値は代入できないこと",
        code: "window.appVersion = 1",
        shouldPass: false,
      },
      {
        description: "number[] の last() が number | undefined を返すこと",
        code: "const l: number | undefined = [1, 2, 3].last()",
        shouldPass: true,
      },
      {
        description: "last() の戻り値は undefined の可能性があるので number には代入できないこと",
        code: "const l: number = [1, 2, 3].last()",
        shouldPass: false,
      },
    ],
  },
];
