import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const problems = [
  // 基本型 Level 1
  {
    category: "primitive-types",
    level: 1,
    difficulty: "easy",
    promptJa: "文字列型の変数nameと、数値型の変数ageを持つオブジェクト型Personを定義してください。",
    starterCode: "type Person = // ここに型を書いてください",
    expectedAnswer: "type Person = { name: string; age: number }",
    hints: [
      "オブジェクト型は { } で定義します",
      "プロパティは「プロパティ名: 型」の形式で書きます",
    ],
    explanation:
      "type aliasを使ってオブジェクト型を定義する基本パターンです。{ name: string; age: number } のように、各プロパティの名前と型をセミコロン区切りで記述します。",
    tags: ["type alias", "object type", "basic"],
    testCases: [
      {
        description: "正しいPerson型のオブジェクトが代入できること",
        code: "const p: Person = { name: 'Taro', age: 25 }",
        shouldPass: true,
      },
      {
        description: "ageが文字列のオブジェクトはエラーになること",
        code: "const p: Person = { name: 'Taro', age: '25' }",
        shouldPass: false,
      },
    ],
  },
  {
    category: "primitive-types",
    level: 1,
    difficulty: "easy",
    promptJa: "boolean型の変数isActiveを定義してください。",
    starterCode: "let isActive: // ここに型を書いてください",
    expectedAnswer: "let isActive: boolean",
    hints: [
      "真偽値を表す型はbooleanです",
    ],
    explanation:
      "booleanはtrue/falseの2値を取る基本型です。フラグやスイッチの状態を表すのに使います。",
    tags: ["boolean", "primitive", "basic"],
    testCases: [
      {
        description: "trueが代入できること",
        code: "isActive = true",
        shouldPass: true,
      },
      {
        description: "falseが代入できること",
        code: "isActive = false",
        shouldPass: true,
      },
      {
        description: "文字列が代入できないこと",
        code: "isActive = 'true'",
        shouldPass: false,
      },
    ],
  },
  {
    category: "primitive-types",
    level: 1,
    difficulty: "easy",
    promptJa: "nullまたはundefinedを許容する文字列型Nullable Stringを定義してください。",
    starterCode: "type NullableString = // ここに型を書いてください",
    expectedAnswer: "type NullableString = string | null | undefined",
    hints: [
      "Union型（|）を使うと複数の型を許容できます",
      "null と undefined は別々の型です",
    ],
    explanation:
      "Union型を使うと、変数が複数の型のいずれかを取ることを表現できます。null と undefined は JavaScript では似た意味を持ちますが、TypeScript では別々の型として扱われます。",
    tags: ["union", "null", "undefined", "basic"],
    testCases: [
      {
        description: "文字列が代入できること",
        code: "const s: NullableString = 'hello'",
        shouldPass: true,
      },
      {
        description: "nullが代入できること",
        code: "const s: NullableString = null",
        shouldPass: true,
      },
      {
        description: "undefinedが代入できること",
        code: "const s: NullableString = undefined",
        shouldPass: true,
      },
      {
        description: "数値は代入できないこと",
        code: "const s: NullableString = 123",
        shouldPass: false,
      },
    ],
  },
  {
    category: "primitive-types",
    level: 1,
    difficulty: "easy",
    promptJa: "文字列リテラル型として \"success\" | \"error\" | \"pending\" を持つStatus型を定義してください。",
    starterCode: "type Status = // ここに型を書いてください",
    expectedAnswer: 'type Status = "success" | "error" | "pending"',
    hints: [
      "リテラル型は具体的な値を型として使用します",
      "Union型と組み合わせて使うことが多いです",
    ],
    explanation:
      "リテラル型は特定の値のみを許容する型です。Union型と組み合わせることで、許容する値を限定できます。これは列挙型の代替としてよく使われます。",
    tags: ["literal types", "union", "basic"],
    testCases: [
      {
        description: '"success"が代入できること',
        code: 'const s: Status = "success"',
        shouldPass: true,
      },
      {
        description: '"error"が代入できること',
        code: 'const s: Status = "error"',
        shouldPass: true,
      },
      {
        description: '"unknown"は代入できないこと',
        code: 'const s: Status = "unknown"',
        shouldPass: false,
      },
    ],
  },
  {
    category: "primitive-types",
    level: 1,
    difficulty: "easy",
    promptJa: "数値の配列型NumberArrayを定義してください。",
    starterCode: "type NumberArray = // ここに型を書いてください",
    expectedAnswer: "type NumberArray = number[]",
    hints: [
      "配列型は型名の後ろに[]をつけます",
      "または Array<型名> という書き方もあります",
    ],
    explanation:
      "配列型は要素の型の後ろに[]をつけて表現します。number[]はnumber型の要素を持つ配列を意味します。Array<number>という書き方も同等です。",
    tags: ["array", "basic"],
    testCases: [
      {
        description: "数値配列が代入できること",
        code: "const arr: NumberArray = [1, 2, 3]",
        shouldPass: true,
      },
      {
        description: "空配列が代入できること",
        code: "const arr: NumberArray = []",
        shouldPass: true,
      },
      {
        description: "文字列配列は代入できないこと",
        code: 'const arr: NumberArray = ["a", "b"]',
        shouldPass: false,
      },
    ],
  },
  // 配列・タプル Level 1
  {
    category: "arrays-tuples",
    level: 1,
    difficulty: "easy",
    promptJa: "文字列と数値のペアを表すタプル型Pairを定義してください。",
    starterCode: "type Pair = // ここに型を書いてください",
    expectedAnswer: "type Pair = [string, number]",
    hints: [
      "タプル型は角括弧 [ ] で定義します",
      "各要素の型を順番に記述します",
    ],
    explanation:
      "タプル型は固定長の配列で、各要素の型を個別に指定できます。[string, number] は最初の要素が文字列、2番目の要素が数値という意味です。",
    tags: ["tuple", "basic"],
    testCases: [
      {
        description: '["hello", 42] が代入できること',
        code: 'const p: Pair = ["hello", 42]',
        shouldPass: true,
      },
      {
        description: "[42, 'hello'] は順序が違うのでエラーになること",
        code: 'const p: Pair = [42, "hello"]',
        shouldPass: false,
      },
    ],
  },
  {
    category: "arrays-tuples",
    level: 1,
    difficulty: "easy",
    promptJa: "読み取り専用の文字列配列型ReadonlyStringsを定義してください。",
    starterCode: "type ReadonlyStrings = // ここに型を書いてください",
    expectedAnswer: "type ReadonlyStrings = readonly string[]",
    hints: [
      "readonly修飾子を使うと変更不可の配列になります",
      "ReadonlyArray<T>という書き方もあります",
    ],
    explanation:
      "readonly修飾子を配列型の前につけると、配列の要素を変更できなくなります。push、pop、splice などのメソッドが使用できなくなり、配列が不変であることを型システムで保証できます。",
    tags: ["readonly", "array", "basic"],
    testCases: [
      {
        description: "文字列配列が代入できること",
        code: 'const arr: ReadonlyStrings = ["a", "b", "c"]',
        shouldPass: true,
      },
      {
        description: "pushメソッドが使えないこと",
        code: 'const arr: ReadonlyStrings = ["a"]; arr.push("b")',
        shouldPass: false,
      },
    ],
  },
  {
    category: "arrays-tuples",
    level: 1,
    difficulty: "easy",
    promptJa: "x座標とy座標を持つ点を表すタプル型Pointを定義してください。両方とも数値型です。",
    starterCode: "type Point = // ここに型を書いてください",
    expectedAnswer: "type Point = [number, number]",
    hints: [
      "タプル型は [型1, 型2, ...] の形式で定義します",
    ],
    explanation:
      "2次元座標のような同じ型の値のペアもタプルで表現できます。配列型 number[] とは異なり、要素数が2つに固定されます。",
    tags: ["tuple", "basic"],
    testCases: [
      {
        description: "[10, 20] が代入できること",
        code: "const p: Point = [10, 20]",
        shouldPass: true,
      },
      {
        description: "[10, 20, 30] は要素数が多いのでエラーになること",
        code: "const p: Point = [10, 20, 30]",
        shouldPass: false,
      },
    ],
  },
  {
    category: "arrays-tuples",
    level: 1,
    difficulty: "easy",
    promptJa: "任意の型の配列を受け取れるジェネリック型GenericArrayを定義してください。",
    starterCode: "type GenericArray<T> = // ここに型を書いてください",
    expectedAnswer: "type GenericArray<T> = T[]",
    hints: [
      "ジェネリクスを使うと任意の型をパラメータとして受け取れます",
      "T はプレースホルダーで、使用時に具体的な型に置き換えられます",
    ],
    explanation:
      "ジェネリクスを使うと、型をパラメータ化できます。GenericArray<string> は string[] と同等、GenericArray<number> は number[] と同等になります。",
    tags: ["generics", "array", "basic"],
    testCases: [
      {
        description: "GenericArray<string>が文字列配列を受け取れること",
        code: 'const arr: GenericArray<string> = ["a", "b"]',
        shouldPass: true,
      },
      {
        description: "GenericArray<number>が数値配列を受け取れること",
        code: "const arr: GenericArray<number> = [1, 2, 3]",
        shouldPass: true,
      },
    ],
  },
  {
    category: "arrays-tuples",
    level: 1,
    difficulty: "easy",
    promptJa: "名前（string）、年齢（number）、アクティブ状態（boolean）の3要素を持つタプル型UserTupleを定義してください。",
    starterCode: "type UserTuple = // ここに型を書いてください",
    expectedAnswer: "type UserTuple = [string, number, boolean]",
    hints: [
      "タプルは複数の異なる型の要素を持てます",
    ],
    explanation:
      "タプルは異なる型の要素を順序付きで保持できます。データベースのレコードやCSVの行を表現するのに便利です。",
    tags: ["tuple", "basic"],
    testCases: [
      {
        description: '["Alice", 30, true] が代入できること',
        code: 'const user: UserTuple = ["Alice", 30, true]',
        shouldPass: true,
      },
      {
        description: "順序が違うとエラーになること",
        code: 'const user: UserTuple = [30, "Alice", true]',
        shouldPass: false,
      },
    ],
  },
  // オブジェクト型 Level 1
  {
    category: "object-types",
    level: 1,
    difficulty: "easy",
    promptJa: "id（number）とtitle（string）を持つinterfaceとしてTodoを定義してください。",
    starterCode: "interface Todo {\n  // ここにプロパティを書いてください\n}",
    expectedAnswer: "interface Todo {\n  id: number;\n  title: string;\n}",
    hints: [
      "interfaceはオブジェクトの形状を定義します",
      "プロパティ名: 型; の形式で記述します",
    ],
    explanation:
      "interfaceはオブジェクトの構造を定義する方法の一つです。type aliasと似ていますが、宣言のマージができるなどの違いがあります。",
    tags: ["interface", "basic"],
    testCases: [
      {
        description: "正しいTodoオブジェクトが代入できること",
        code: 'const todo: Todo = { id: 1, title: "Learn TypeScript" }',
        shouldPass: true,
      },
      {
        description: "idがない場合エラーになること",
        code: 'const todo: Todo = { title: "Learn TypeScript" }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "object-types",
    level: 1,
    difficulty: "easy",
    promptJa: "必須のnameプロパティ（string）とオプショナルなageプロパティ（number）を持つPerson型を定義してください。",
    starterCode: "type Person = // ここに型を書いてください",
    expectedAnswer: "type Person = { name: string; age?: number }",
    hints: [
      "オプショナルプロパティは ? を使います",
      "age?: number は age が undefined でもよいことを意味します",
    ],
    explanation:
      "プロパティ名の後に ? をつけると、そのプロパティはオプショナル（省略可能）になります。存在しない場合は undefined として扱われます。",
    tags: ["optional", "object type", "basic"],
    testCases: [
      {
        description: "nameのみのオブジェクトが代入できること",
        code: 'const p: Person = { name: "Taro" }',
        shouldPass: true,
      },
      {
        description: "nameとageのオブジェクトが代入できること",
        code: 'const p: Person = { name: "Taro", age: 25 }',
        shouldPass: true,
      },
      {
        description: "nameがないとエラーになること",
        code: "const p: Person = { age: 25 }",
        shouldPass: false,
      },
    ],
  },
  {
    category: "object-types",
    level: 1,
    difficulty: "easy",
    promptJa: "読み取り専用のidプロパティ（number）と変更可能なnameプロパティ（string）を持つUser型を定義してください。",
    starterCode: "type User = // ここに型を書いてください",
    expectedAnswer: "type User = { readonly id: number; name: string }",
    hints: [
      "readonly修飾子でプロパティを変更不可にできます",
    ],
    explanation:
      "readonlyを使うと、そのプロパティへの再代入を禁止できます。オブジェクト作成後に変更されてはいけない値（IDなど）に使用します。",
    tags: ["readonly", "object type", "basic"],
    testCases: [
      {
        description: "正しいUserオブジェクトが代入できること",
        code: 'const user: User = { id: 1, name: "Alice" }',
        shouldPass: true,
      },
      {
        description: "idを変更しようとするとエラーになること",
        code: 'const user: User = { id: 1, name: "Alice" }; user.id = 2',
        shouldPass: false,
      },
      {
        description: "nameは変更できること",
        code: 'const user: User = { id: 1, name: "Alice" }; user.name = "Bob"',
        shouldPass: true,
      },
    ],
  },
  {
    category: "object-types",
    level: 1,
    difficulty: "easy",
    promptJa: "文字列キーと数値バリューを持つIndex Signature型Scoresを定義してください。",
    starterCode: "type Scores = // ここに型を書いてください",
    expectedAnswer: "type Scores = { [key: string]: number }",
    hints: [
      "Index Signatureは [key: キーの型]: 値の型 で定義します",
      "任意のキーを受け入れられるオブジェクトを定義できます",
    ],
    explanation:
      "Index Signatureを使うと、キーの型と値の型を指定して、任意のキーを持つオブジェクトを定義できます。辞書型やマップの代わりに使えます。",
    tags: ["index signature", "object type", "basic"],
    testCases: [
      {
        description: "複数のスコアが登録できること",
        code: 'const scores: Scores = { math: 90, english: 85 }',
        shouldPass: true,
      },
      {
        description: "空オブジェクトも代入できること",
        code: "const scores: Scores = {}",
        shouldPass: true,
      },
      {
        description: "値が文字列だとエラーになること",
        code: 'const scores: Scores = { math: "A" }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "object-types",
    level: 1,
    difficulty: "easy",
    promptJa: "xとy（両方number）を持つPoint interfaceを拡張して、z（number）も追加したPoint3D interfaceを定義してください。",
    starterCode: "interface Point {\n  x: number;\n  y: number;\n}\n\ninterface Point3D // ここを完成させてください",
    expectedAnswer: "interface Point {\n  x: number;\n  y: number;\n}\n\ninterface Point3D extends Point {\n  z: number;\n}",
    hints: [
      "extendsキーワードでinterfaceを拡張できます",
      "親interfaceのプロパティを継承しつつ、新しいプロパティを追加できます",
    ],
    explanation:
      "interfaceはextendsキーワードで拡張できます。これにより、既存の型を再利用しつつ、新しいプロパティを追加できます。",
    tags: ["interface", "extends", "basic"],
    testCases: [
      {
        description: "x, y, zを持つオブジェクトが代入できること",
        code: "const p: Point3D = { x: 1, y: 2, z: 3 }",
        shouldPass: true,
      },
      {
        description: "zがないとエラーになること",
        code: "const p: Point3D = { x: 1, y: 2 }",
        shouldPass: false,
      },
    ],
  },
  // Union/Intersection Level 1
  {
    category: "union-intersection",
    level: 1,
    difficulty: "easy",
    promptJa: "stringまたはnumberを受け入れるStringOrNumber型を定義してください。",
    starterCode: "type StringOrNumber = // ここに型を書いてください",
    expectedAnswer: "type StringOrNumber = string | number",
    hints: [
      "Union型は | で複数の型を結合します",
    ],
    explanation:
      "Union型は「いずれかの型」を表します。string | number は文字列または数値のどちらかを受け入れることを意味します。",
    tags: ["union", "basic"],
    testCases: [
      {
        description: "文字列が代入できること",
        code: 'const value: StringOrNumber = "hello"',
        shouldPass: true,
      },
      {
        description: "数値が代入できること",
        code: "const value: StringOrNumber = 42",
        shouldPass: true,
      },
      {
        description: "booleanは代入できないこと",
        code: "const value: StringOrNumber = true",
        shouldPass: false,
      },
    ],
  },
  {
    category: "union-intersection",
    level: 1,
    difficulty: "easy",
    promptJa: "Aという型{a: string}とBという型{b: number}の両方のプロパティを持つIntersection型ABを定義してください。",
    starterCode: "type A = { a: string };\ntype B = { b: number };\n\ntype AB = // ここに型を書いてください",
    expectedAnswer: "type A = { a: string };\ntype B = { b: number };\n\ntype AB = A & B",
    hints: [
      "Intersection型は & で複数の型を結合します",
      "両方の型のプロパティをすべて持つ型になります",
    ],
    explanation:
      "Intersection型は「すべての型を満たす」型を作ります。A & B は A の性質も B の性質も持つオブジェクトを表します。",
    tags: ["intersection", "basic"],
    testCases: [
      {
        description: "aとbの両方を持つオブジェクトが代入できること",
        code: 'const ab: AB = { a: "hello", b: 42 }',
        shouldPass: true,
      },
      {
        description: "aしか持たないオブジェクトはエラーになること",
        code: 'const ab: AB = { a: "hello" }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "union-intersection",
    level: 1,
    difficulty: "medium",
    promptJa: 'type属性が"dog"の場合barkプロパティ、"cat"の場合meowプロパティを持つ、Discriminated Union型Animalを定義してください。',
    starterCode: 'type Animal = // ここに型を書いてください',
    expectedAnswer: 'type Animal = { type: "dog"; bark: () => void } | { type: "cat"; meow: () => void }',
    hints: [
      "Discriminated Unionは共通の判別プロパティを持つUnion型です",
      "type属性をリテラル型で定義すると、分岐で型を絞り込めます",
    ],
    explanation:
      "Discriminated Unionは型の安全な分岐を可能にするパターンです。共通の判別プロパティ（ここではtype）を使って、どのUnionメンバーかを判定できます。",
    tags: ["discriminated union", "union", "medium"],
    testCases: [
      {
        description: "dogタイプのAnimalが定義できること",
        code: 'const dog: Animal = { type: "dog", bark: () => {} }',
        shouldPass: true,
      },
      {
        description: "catタイプのAnimalが定義できること",
        code: 'const cat: Animal = { type: "cat", meow: () => {} }',
        shouldPass: true,
      },
      {
        description: "dogにmeowがあるとエラーになること",
        code: 'const dog: Animal = { type: "dog", meow: () => {} }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "union-intersection",
    level: 1,
    difficulty: "easy",
    promptJa: "配列または単一の値を受け入れるMaybeArray<T>型を定義してください。",
    starterCode: "type MaybeArray<T> = // ここに型を書いてください",
    expectedAnswer: "type MaybeArray<T> = T | T[]",
    hints: [
      "ジェネリクスとUnion型を組み合わせます",
      "T | T[] で単一値または配列を表現できます",
    ],
    explanation:
      "ジェネリクスとUnion型を組み合わせることで、柔軟な型を定義できます。APIのレスポンスが単一オブジェクトまたは配列の場合などに便利です。",
    tags: ["union", "generics", "basic"],
    testCases: [
      {
        description: "単一の数値が代入できること",
        code: "const value: MaybeArray<number> = 42",
        shouldPass: true,
      },
      {
        description: "数値の配列が代入できること",
        code: "const value: MaybeArray<number> = [1, 2, 3]",
        shouldPass: true,
      },
      {
        description: "MaybeArray<string>に数値を代入できないこと",
        code: "const value: MaybeArray<string> = 42",
        shouldPass: false,
      },
    ],
  },
  {
    category: "union-intersection",
    level: 1,
    difficulty: "easy",
    promptJa: "null許容な型を作るNullable<T>型を定義してください。",
    starterCode: "type Nullable<T> = // ここに型を書いてください",
    expectedAnswer: "type Nullable<T> = T | null",
    hints: [
      "ジェネリクスを使って任意の型にnullを許容させます",
    ],
    explanation:
      "Nullable<T> は任意の型 T にnullを許容する型を作るユーティリティです。データベースのNULL可能な値を表現するのに便利です。",
    tags: ["union", "generics", "null", "basic"],
    testCases: [
      {
        description: "Nullable<string>に文字列が代入できること",
        code: 'const value: Nullable<string> = "hello"',
        shouldPass: true,
      },
      {
        description: "Nullable<string>にnullが代入できること",
        code: "const value: Nullable<string> = null",
        shouldPass: true,
      },
      {
        description: "Nullable<string>にundefinedは代入できないこと",
        code: "const value: Nullable<string> = undefined",
        shouldPass: false,
      },
    ],
  },
  // 関数型 Level 1
  {
    category: "function-types",
    level: 1,
    difficulty: "easy",
    promptJa: "2つのnumberを受け取り、numberを返す関数型AddFnを定義してください。",
    starterCode: "type AddFn = // ここに型を書いてください",
    expectedAnswer: "type AddFn = (a: number, b: number) => number",
    hints: [
      "関数型は (引数: 型, ...) => 戻り値の型 で定義します",
    ],
    explanation:
      "アロー関数の構文に似た形で関数型を定義できます。(a: number, b: number) => number は2つのnumberを受け取りnumberを返す関数を表します。",
    tags: ["function type", "basic"],
    testCases: [
      {
        description: "正しい関数が代入できること",
        code: "const add: AddFn = (a, b) => a + b",
        shouldPass: true,
      },
      {
        description: "文字列を返す関数は代入できないこと",
        code: 'const add: AddFn = (a, b) => "result"',
        shouldPass: false,
      },
    ],
  },
  {
    category: "function-types",
    level: 1,
    difficulty: "easy",
    promptJa: "何も返さない（void）コールバック関数型VoidCallbackを定義してください。引数はありません。",
    starterCode: "type VoidCallback = // ここに型を書いてください",
    expectedAnswer: "type VoidCallback = () => void",
    hints: [
      "戻り値がない関数はvoid型を使います",
      "引数がない場合は () を使います",
    ],
    explanation:
      "voidは関数が値を返さないことを示します。イベントハンドラやコールバックによく使われます。",
    tags: ["function type", "void", "basic"],
    testCases: [
      {
        description: "値を返さない関数が代入できること",
        code: 'const cb: VoidCallback = () => { console.log("done") }',
        shouldPass: true,
      },
      {
        description: "引数を取る関数は代入できないこと",
        code: "const cb: VoidCallback = (x: number) => {}",
        shouldPass: false,
      },
    ],
  },
  {
    category: "function-types",
    level: 1,
    difficulty: "easy",
    promptJa: "文字列を受け取りその長さ（number）を返す関数型GetLengthFnを定義してください。",
    starterCode: "type GetLengthFn = // ここに型を書いてください",
    expectedAnswer: "type GetLengthFn = (str: string) => number",
    hints: [
      "引数の名前は任意で指定できます",
    ],
    explanation:
      "関数型の引数名は型の一部ではありませんが、ドキュメントとして役立ちます。strという名前は引数の意味を明確にします。",
    tags: ["function type", "basic"],
    testCases: [
      {
        description: "文字列の長さを返す関数が代入できること",
        code: "const getLen: GetLengthFn = (s) => s.length",
        shouldPass: true,
      },
      {
        description: "数値を引数に取る関数は代入できないこと",
        code: "const getLen: GetLengthFn = (n: number) => n",
        shouldPass: false,
      },
    ],
  },
  {
    category: "function-types",
    level: 1,
    difficulty: "easy",
    promptJa: "オプショナルな第2引数を持つGreetFn型を定義してください。name（string）は必須、greeting（string）はオプションで、戻り値はstringです。",
    starterCode: "type GreetFn = // ここに型を書いてください",
    expectedAnswer: "type GreetFn = (name: string, greeting?: string) => string",
    hints: [
      "オプショナル引数は ? を使います",
      "オプショナル引数は必須引数の後に置きます",
    ],
    explanation:
      "関数のオプショナル引数は引数名の後に ? をつけて定義します。呼び出し時に省略可能で、省略された場合はundefinedになります。",
    tags: ["function type", "optional", "basic"],
    testCases: [
      {
        description: "1引数で呼べる関数が代入できること",
        code: 'const greet: GreetFn = (name) => `Hello, ${name}`',
        shouldPass: true,
      },
      {
        description: "2引数で呼べる関数が代入できること",
        code: "const greet: GreetFn = (name, greeting) => `${greeting || 'Hello'}, ${name}`",
        shouldPass: true,
      },
    ],
  },
  {
    category: "function-types",
    level: 1,
    difficulty: "easy",
    promptJa: "任意の数のnumberを受け取り、その合計（number）を返す関数型SumFnを定義してください。",
    starterCode: "type SumFn = // ここに型を書いてください",
    expectedAnswer: "type SumFn = (...numbers: number[]) => number",
    hints: [
      "Rest parametersは ...名前: 型[] で定義します",
      "可変長引数を受け取れます",
    ],
    explanation:
      "Rest parametersを使うと、任意の数の引数を配列として受け取れます。...numbers: number[] は0個以上のnumberを配列として受け取ります。",
    tags: ["function type", "rest parameters", "basic"],
    testCases: [
      {
        description: "複数の引数を受け取る関数が代入できること",
        code: "const sum: SumFn = (...nums) => nums.reduce((a, b) => a + b, 0)",
        shouldPass: true,
      },
      {
        description: "引数なしでも呼べること",
        code: "const sum: SumFn = (...nums) => nums.reduce((a, b) => a + b, 0); sum()",
        shouldPass: true,
      },
    ],
  },
  // ジェネリクス Level 1
  {
    category: "generics",
    level: 1,
    difficulty: "easy",
    promptJa: "任意の型Tを受け取り、その値をラップするBox<T>型を定義してください。valueプロパティを持ちます。",
    starterCode: "type Box<T> = // ここに型を書いてください",
    expectedAnswer: "type Box<T> = { value: T }",
    hints: [
      "ジェネリクスの型パラメータはプロパティの型として使えます",
    ],
    explanation:
      "ジェネリクスを使うと、任意の型をラップするコンテナ型を作れます。Box<string> は { value: string }、Box<number> は { value: number } になります。",
    tags: ["generics", "basic"],
    testCases: [
      {
        description: "Box<string>に文字列が入れられること",
        code: 'const box: Box<string> = { value: "hello" }',
        shouldPass: true,
      },
      {
        description: "Box<number>に数値が入れられること",
        code: "const box: Box<number> = { value: 42 }",
        shouldPass: true,
      },
      {
        description: "Box<string>に数値を入れるとエラーになること",
        code: "const box: Box<string> = { value: 42 }",
        shouldPass: false,
      },
    ],
  },
  {
    category: "generics",
    level: 1,
    difficulty: "easy",
    promptJa: "2つの型引数KとVを持ち、keyとvalueプロパティを持つKeyValue<K, V>型を定義してください。",
    starterCode: "type KeyValue<K, V> = // ここに型を書いてください",
    expectedAnswer: "type KeyValue<K, V> = { key: K; value: V }",
    hints: [
      "複数の型パラメータはカンマで区切ります",
    ],
    explanation:
      "複数の型パラメータを持つジェネリクスを定義できます。KeyValue<string, number> は { key: string; value: number } になります。",
    tags: ["generics", "basic"],
    testCases: [
      {
        description: "KeyValue<string, number>が使えること",
        code: 'const kv: KeyValue<string, number> = { key: "age", value: 25 }',
        shouldPass: true,
      },
      {
        description: "型が合わないとエラーになること",
        code: 'const kv: KeyValue<string, number> = { key: 123, value: 25 }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "generics",
    level: 1,
    difficulty: "easy",
    promptJa: "デフォルト型パラメータを持つContainer<T = string>型を定義してください。itemプロパティを持ちます。",
    starterCode: "type Container<T = string> = // ここを完成させてください",
    expectedAnswer: "type Container<T = string> = { item: T }",
    hints: [
      "型パラメータにデフォルト値を設定できます",
      "= で指定したいデフォルト型を設定します",
    ],
    explanation:
      "型パラメータにデフォルト値を設定すると、型引数を省略した場合にそのデフォルト値が使われます。Container は Container<string> と同等になります。",
    tags: ["generics", "default type", "basic"],
    testCases: [
      {
        description: "型引数なしで使えること（stringがデフォルト）",
        code: 'const c: Container = { item: "hello" }',
        shouldPass: true,
      },
      {
        description: "型引数を指定できること",
        code: "const c: Container<number> = { item: 42 }",
        shouldPass: true,
      },
      {
        description: "デフォルトの場合、numberは代入できないこと",
        code: "const c: Container = { item: 42 }",
        shouldPass: false,
      },
    ],
  },
  {
    category: "generics",
    level: 1,
    difficulty: "easy",
    promptJa: "同じ型Tの2つの値を持つPair<T>型を定義してください。firstとsecondプロパティを持ちます。",
    starterCode: "type Pair<T> = // ここに型を書いてください",
    expectedAnswer: "type Pair<T> = { first: T; second: T }",
    hints: [
      "同じ型パラメータを複数のプロパティに使えます",
    ],
    explanation:
      "同じ型パラメータを複数回使うことで、プロパティ間の型の一貫性を保証できます。Pair<number>はfirstもsecondもnumberになります。",
    tags: ["generics", "basic"],
    testCases: [
      {
        description: "Pair<string>が使えること",
        code: 'const p: Pair<string> = { first: "a", second: "b" }',
        shouldPass: true,
      },
      {
        description: "firstとsecondの型が違うとエラーになること",
        code: 'const p: Pair<string> = { first: "a", second: 42 }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "generics",
    level: 1,
    difficulty: "medium",
    promptJa: "配列の要素型を取得するArrayElement<T>型を定義してください。Tが配列の場合その要素型を、そうでなければneverを返します。",
    starterCode: "type ArrayElement<T> = // ここに型を書いてください",
    expectedAnswer: "type ArrayElement<T> = T extends (infer U)[] ? U : never",
    hints: [
      "条件型 (extends ... ? A : B) を使います",
      "inferキーワードで配列の要素型を推論できます",
    ],
    explanation:
      "条件型とinferを組み合わせると、複雑な型の一部を抽出できます。T extends (infer U)[] ? U : never は配列型から要素型を取り出します。",
    tags: ["generics", "conditional types", "infer", "medium"],
    testCases: [
      {
        description: "string[]からstringが取り出せること",
        code: "type R = ArrayElement<string[]>; const r: R = 'hello'",
        shouldPass: true,
      },
      {
        description: "number[]からnumberが取り出せること",
        code: "type R = ArrayElement<number[]>; const r: R = 42",
        shouldPass: true,
      },
      {
        description: "配列でない型からはneverになること",
        code: "type R = ArrayElement<string>; const r: R = 'hello'",
        shouldPass: false,
      },
    ],
  },
  // ユーティリティ型 Level 1
  {
    category: "utility-types",
    level: 1,
    difficulty: "easy",
    promptJa: "User型からnameとemailのみを抽出したUserContact型を、Pickを使って定義してください。",
    starterCode: 'type User = { id: number; name: string; email: string; age: number };\n\ntype UserContact = // ここにPickを使って書いてください',
    expectedAnswer: 'type User = { id: number; name: string; email: string; age: number };\n\ntype UserContact = Pick<User, "name" | "email">',
    hints: [
      "Pick<T, K>でオブジェクト型から特定のキーのみを抽出できます",
      "キーはUnion型で複数指定できます",
    ],
    explanation:
      "Pick<T, K>は型Tから指定したキーKのみを持つ新しい型を作ります。元の型から必要なプロパティだけを選択するのに便利です。",
    tags: ["utility types", "Pick", "basic"],
    testCases: [
      {
        description: "nameとemailのみ持つオブジェクトが代入できること",
        code: 'const contact: UserContact = { name: "Alice", email: "a@example.com" }',
        shouldPass: true,
      },
      {
        description: "idを含むとエラーになること",
        code: 'const contact: UserContact = { id: 1, name: "Alice", email: "a@example.com" }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "utility-types",
    level: 1,
    difficulty: "easy",
    promptJa: "User型からageを除外したUserWithoutAge型を、Omitを使って定義してください。",
    starterCode: 'type User = { id: number; name: string; email: string; age: number };\n\ntype UserWithoutAge = // ここにOmitを使って書いてください',
    expectedAnswer: 'type User = { id: number; name: string; email: string; age: number };\n\ntype UserWithoutAge = Omit<User, "age">',
    hints: [
      "Omit<T, K>でオブジェクト型から特定のキーを除外できます",
    ],
    explanation:
      "Omit<T, K>は型Tから指定したキーKを除外した新しい型を作ります。Pickの逆の操作です。",
    tags: ["utility types", "Omit", "basic"],
    testCases: [
      {
        description: "ageを含まないオブジェクトが代入できること",
        code: 'const user: UserWithoutAge = { id: 1, name: "Alice", email: "a@example.com" }',
        shouldPass: true,
      },
      {
        description: "ageを含むとエラーになること",
        code: 'const user: UserWithoutAge = { id: 1, name: "Alice", email: "a@example.com", age: 25 }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "utility-types",
    level: 1,
    difficulty: "easy",
    promptJa: "すべてのプロパティがオプショナルになったPartialUser型を、Partialを使って定義してください。",
    starterCode: 'type User = { id: number; name: string; email: string };\n\ntype PartialUser = // ここにPartialを使って書いてください',
    expectedAnswer: "type User = { id: number; name: string; email: string };\n\ntype PartialUser = Partial<User>",
    hints: [
      "Partial<T>ですべてのプロパティをオプショナルにできます",
    ],
    explanation:
      "Partial<T>は型Tのすべてのプロパティをオプショナル（?）にします。更新用のオブジェクトなど、一部のプロパティのみを指定する場合に便利です。",
    tags: ["utility types", "Partial", "basic"],
    testCases: [
      {
        description: "空オブジェクトが代入できること",
        code: "const user: PartialUser = {}",
        shouldPass: true,
      },
      {
        description: "一部のプロパティのみ持つオブジェクトが代入できること",
        code: 'const user: PartialUser = { name: "Alice" }',
        shouldPass: true,
      },
    ],
  },
  {
    category: "utility-types",
    level: 1,
    difficulty: "easy",
    promptJa: "すべてのプロパティが必須になったRequiredUser型を、Requiredを使って定義してください。",
    starterCode: 'type User = { id?: number; name?: string; email?: string };\n\ntype RequiredUser = // ここにRequiredを使って書いてください',
    expectedAnswer: "type User = { id?: number; name?: string; email?: string };\n\ntype RequiredUser = Required<User>",
    hints: [
      "Required<T>ですべてのプロパティを必須にできます",
    ],
    explanation:
      "Required<T>は型Tのすべてのプロパティから?を取り除き、必須にします。Partialの逆の操作です。",
    tags: ["utility types", "Required", "basic"],
    testCases: [
      {
        description: "すべてのプロパティを持つオブジェクトが代入できること",
        code: 'const user: RequiredUser = { id: 1, name: "Alice", email: "a@example.com" }',
        shouldPass: true,
      },
      {
        description: "一部が欠けているとエラーになること",
        code: 'const user: RequiredUser = { id: 1, name: "Alice" }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "utility-types",
    level: 1,
    difficulty: "easy",
    promptJa: "すべてのプロパティが読み取り専用になったReadonlyUser型を、Readonlyを使って定義してください。",
    starterCode: 'type User = { id: number; name: string; email: string };\n\ntype ReadonlyUser = // ここにReadonlyを使って書いてください',
    expectedAnswer: "type User = { id: number; name: string; email: string };\n\ntype ReadonlyUser = Readonly<User>",
    hints: [
      "Readonly<T>ですべてのプロパティを読み取り専用にできます",
    ],
    explanation:
      "Readonly<T>は型Tのすべてのプロパティにreadonlyを付加します。不変オブジェクトを表現するのに使います。",
    tags: ["utility types", "Readonly", "basic"],
    testCases: [
      {
        description: "プロパティを変更しようとするとエラーになること",
        code: 'const user: ReadonlyUser = { id: 1, name: "Alice", email: "a@example.com" }; user.name = "Bob"',
        shouldPass: false,
      },
      {
        description: "読み取りはできること",
        code: 'const user: ReadonlyUser = { id: 1, name: "Alice", email: "a@example.com" }; const n = user.name',
        shouldPass: true,
      },
    ],
  },
  // 条件型 Level 1
  {
    category: "conditional-types",
    level: 1,
    difficulty: "easy",
    promptJa: "Tがstringならtrue、そうでなければfalseを返すIsString<T>型を定義してください。",
    starterCode: "type IsString<T> = // ここに型を書いてください",
    expectedAnswer: "type IsString<T> = T extends string ? true : false",
    hints: [
      "条件型は T extends U ? A : B の形式で書きます",
      "三項演算子に似た構文です",
    ],
    explanation:
      "条件型は型レベルのif-else文です。T extends string は「TがstringのサブタイプであるかТを判定し、結果に応じて異なる型を返します。",
    tags: ["conditional types", "basic"],
    testCases: [
      {
        description: "IsString<string>がtrueになること",
        code: "type R = IsString<string>; const r: R = true",
        shouldPass: true,
      },
      {
        description: "IsString<number>がfalseになること",
        code: "type R = IsString<number>; const r: R = false",
        shouldPass: true,
      },
      {
        description: "IsString<string>でfalseは代入できないこと",
        code: "type R = IsString<string>; const r: R = false",
        shouldPass: false,
      },
    ],
  },
  {
    category: "conditional-types",
    level: 1,
    difficulty: "easy",
    promptJa: "Tがnullまたはundefinedならnever、そうでなければTを返すNonNullable<T>型を定義してください。",
    starterCode: "type MyNonNullable<T> = // ここに型を書いてください",
    expectedAnswer: "type MyNonNullable<T> = T extends null | undefined ? never : T",
    hints: [
      "nullとundefinedのUnion型に対してextendsを使います",
      "neverは「存在しない」型を表します",
    ],
    explanation:
      "NonNullableはTypeScript標準のユーティリティ型です。null/undefinedを除外することで、値が確実に存在することを型レベルで保証します。",
    tags: ["conditional types", "never", "basic"],
    testCases: [
      {
        description: "MyNonNullable<string>がstringになること",
        code: 'type R = MyNonNullable<string>; const r: R = "hello"',
        shouldPass: true,
      },
      {
        description: "MyNonNullable<null>がneverになること",
        code: "type R = MyNonNullable<null>; const r: R = null",
        shouldPass: false,
      },
    ],
  },
  {
    category: "conditional-types",
    level: 1,
    difficulty: "medium",
    promptJa: "Tが配列型ならその要素型を、そうでなければT自体を返すUnwrap<T>型を定義してください。",
    starterCode: "type Unwrap<T> = // ここに型を書いてください",
    expectedAnswer: "type Unwrap<T> = T extends (infer U)[] ? U : T",
    hints: [
      "inferキーワードで型変数を導入できます",
      "T extends (infer U)[] で配列の要素型Uを取得できます",
    ],
    explanation:
      "inferは条件型の中で型を推論し、新しい型変数に束縛します。(infer U)[]パターンで配列の要素型を抽出できます。",
    tags: ["conditional types", "infer", "medium"],
    testCases: [
      {
        description: "Unwrap<string[]>がstringになること",
        code: "type R = Unwrap<string[]>; const r: R = 'hello'",
        shouldPass: true,
      },
      {
        description: "Unwrap<number>がnumberになること",
        code: "type R = Unwrap<number>; const r: R = 42",
        shouldPass: true,
      },
    ],
  },
  {
    category: "conditional-types",
    level: 1,
    difficulty: "easy",
    promptJa: "Tがobject型（nullを除く）ならtrue、そうでなければfalseを返すIsObject<T>型を定義してください。",
    starterCode: "type IsObject<T> = // ここに型を書いてください",
    expectedAnswer: "type IsObject<T> = T extends object ? true : false",
    hints: [
      "objectはnullを除くすべてのオブジェクト型にマッチします",
      "プリミティブ型（string, number, etc.）はobjectではありません",
    ],
    explanation:
      "TypeScriptのobject型はすべての非プリミティブ型にマッチします。配列、関数、オブジェクトリテラルなどがobjectに該当します。",
    tags: ["conditional types", "object", "basic"],
    testCases: [
      {
        description: "IsObject<{a: 1}>がtrueになること",
        code: "type R = IsObject<{a: 1}>; const r: R = true",
        shouldPass: true,
      },
      {
        description: "IsObject<string>がfalseになること",
        code: "type R = IsObject<string>; const r: R = false",
        shouldPass: true,
      },
      {
        description: "IsObject<number[]>がtrueになること",
        code: "type R = IsObject<number[]>; const r: R = true",
        shouldPass: true,
      },
    ],
  },
  {
    category: "conditional-types",
    level: 1,
    difficulty: "easy",
    promptJa: "Tが関数型ならその戻り値の型を、そうでなければneverを返すMyReturnType<T>型を定義してください。",
    starterCode: "type MyReturnType<T> = // ここに型を書いてください",
    expectedAnswer: "type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never",
    hints: [
      "関数型は (...args: any[]) => 戻り値 でマッチできます",
      "inferで戻り値の型を取得できます",
    ],
    explanation:
      "ReturnTypeはTypeScript標準のユーティリティ型です。関数型から戻り値の型を抽出します。inferを使って関数の構造から型を推論します。",
    tags: ["conditional types", "infer", "ReturnType", "basic"],
    testCases: [
      {
        description: "() => string からstringが取得できること",
        code: "type R = MyReturnType<() => string>; const r: R = 'hello'",
        shouldPass: true,
      },
      {
        description: "(a: number) => boolean からbooleanが取得できること",
        code: "type R = MyReturnType<(a: number) => boolean>; const r: R = true",
        shouldPass: true,
      },
      {
        description: "関数でない型からはneverになること",
        code: "type R = MyReturnType<string>; const r: R = 'hello'",
        shouldPass: false,
      },
    ],
  },
  // Mapped Types Level 1
  {
    category: "mapped-types",
    level: 1,
    difficulty: "easy",
    promptJa: "オブジェクト型Tのすべてのプロパティをstring型にするStringify<T>型を定義してください。",
    starterCode: "type Stringify<T> = // ここに型を書いてください",
    expectedAnswer: "type Stringify<T> = { [K in keyof T]: string }",
    hints: [
      "Mapped Typeは { [K in keyof T]: 型 } の形式で書きます",
      "keyof Tでオブジェクトのキーを取得できます",
    ],
    explanation:
      "Mapped Typeはオブジェクト型の各プロパティを変換する型です。[K in keyof T]でTのすべてのキーをイテレートし、新しい型を作ります。",
    tags: ["mapped types", "keyof", "basic"],
    testCases: [
      {
        description: "すべてのプロパティがstringになること",
        code: 'type R = Stringify<{ a: number; b: boolean }>; const r: R = { a: "1", b: "true" }',
        shouldPass: true,
      },
      {
        description: "numberは代入できないこと",
        code: 'type R = Stringify<{ a: number }>; const r: R = { a: 1 }',
        shouldPass: false,
      },
    ],
  },
  {
    category: "mapped-types",
    level: 1,
    difficulty: "easy",
    promptJa: "オブジェクト型TのすべてのプロパティをオプショナルにするMyPartial<T>型を定義してください（Partialの再実装）。",
    starterCode: "type MyPartial<T> = // ここに型を書いてください",
    expectedAnswer: "type MyPartial<T> = { [K in keyof T]?: T[K] }",
    hints: [
      "プロパティをオプショナルにするには ? を使います",
      "T[K] で元の型を参照できます",
    ],
    explanation:
      "Mapped Typeでは修飾子（?やreadonly）を追加できます。[K in keyof T]?: T[K] は各プロパティをオプショナルにしつつ、元の型を保持します。",
    tags: ["mapped types", "optional", "basic"],
    testCases: [
      {
        description: "空オブジェクトが代入できること",
        code: "type R = MyPartial<{ a: number; b: string }>; const r: R = {}",
        shouldPass: true,
      },
      {
        description: "一部のプロパティだけでも代入できること",
        code: "type R = MyPartial<{ a: number; b: string }>; const r: R = { a: 1 }",
        shouldPass: true,
      },
    ],
  },
  {
    category: "mapped-types",
    level: 1,
    difficulty: "easy",
    promptJa: "オブジェクト型Tのすべてのプロパティを読み取り専用にするMyReadonly<T>型を定義してください（Readonlyの再実装）。",
    starterCode: "type MyReadonly<T> = // ここに型を書いてください",
    expectedAnswer: "type MyReadonly<T> = { readonly [K in keyof T]: T[K] }",
    hints: [
      "readonlyを追加するにはreadonly修飾子を使います",
    ],
    explanation:
      "Mapped Typeでreadonly修飾子を追加すると、すべてのプロパティが読み取り専用になります。不変オブジェクトを作成するのに役立ちます。",
    tags: ["mapped types", "readonly", "basic"],
    testCases: [
      {
        description: "プロパティを変更しようとするとエラーになること",
        code: "type R = MyReadonly<{ a: number }>; const r: R = { a: 1 }; r.a = 2",
        shouldPass: false,
      },
      {
        description: "読み取りはできること",
        code: "type R = MyReadonly<{ a: number }>; const r: R = { a: 1 }; const x = r.a",
        shouldPass: true,
      },
    ],
  },
  {
    category: "mapped-types",
    level: 1,
    difficulty: "easy",
    promptJa: "すべてのキーがKで、値がVであるオブジェクト型を作るMyRecord<K, V>型を定義してください。",
    starterCode: "type MyRecord<K extends string, V> = // ここに型を書いてください",
    expectedAnswer: "type MyRecord<K extends string, V> = { [P in K]: V }",
    hints: [
      "キーの集合Kに対してイテレートします",
      "K extends string でKが文字列のUnion型であることを制約します",
    ],
    explanation:
      "Recordはキーと値の型を指定してオブジェクト型を作ります。Record<'a' | 'b', number>は { a: number; b: number } と同等です。",
    tags: ["mapped types", "Record", "basic"],
    testCases: [
      {
        description: "指定したキーと値の型を持つこと",
        code: "type R = MyRecord<'a' | 'b', number>; const r: R = { a: 1, b: 2 }",
        shouldPass: true,
      },
      {
        description: "キーが足りないとエラーになること",
        code: "type R = MyRecord<'a' | 'b', number>; const r: R = { a: 1 }",
        shouldPass: false,
      },
    ],
  },
  {
    category: "mapped-types",
    level: 1,
    difficulty: "medium",
    promptJa: "オブジェクト型Tから特定のキーKのみを抽出するMyPick<T, K>型を定義してください（Pickの再実装）。",
    starterCode: "type MyPick<T, K extends keyof T> = // ここに型を書いてください",
    expectedAnswer: "type MyPick<T, K extends keyof T> = { [P in K]: T[P] }",
    hints: [
      "K extends keyof T でKがTのキーであることを制約します",
      "Kに対してのみイテレートします",
    ],
    explanation:
      "Pickは元の型から指定したキーのみを抽出します。K extends keyof T によって、存在しないキーを指定するとコンパイルエラーになります。",
    tags: ["mapped types", "Pick", "medium"],
    testCases: [
      {
        description: "指定したキーのみ持つオブジェクトが作れること",
        code: "type R = MyPick<{ a: 1; b: 2; c: 3 }, 'a' | 'b'>; const r: R = { a: 1, b: 2 }",
        shouldPass: true,
      },
      {
        description: "指定していないキーを含むとエラーになること",
        code: "type R = MyPick<{ a: 1; b: 2; c: 3 }, 'a'>; const r: R = { a: 1, b: 2 }",
        shouldPass: false,
      },
    ],
  },
  // 型パズル Level 1
  {
    category: "advanced-patterns",
    level: 1,
    difficulty: "easy",
    promptJa: "as constで定義された配列から、その要素のUnion型を取得するArrayValues<T>型を定義してください。",
    starterCode: "type ArrayValues<T extends readonly unknown[]> = // ここに型を書いてください",
    expectedAnswer: "type ArrayValues<T extends readonly unknown[]> = T[number]",
    hints: [
      "配列型に[number]でインデックスアクセスすると要素型が得られます",
      "as constで定義した配列はreadonly配列になります",
    ],
    explanation:
      "T[number]は配列型Tの要素型を取得します。as constで定義された配列の場合、リテラル型のUnionが得られます。",
    tags: ["type patterns", "as const", "basic"],
    testCases: [
      {
        description: "配列の要素がUnion型になること",
        code: "const arr = ['a', 'b', 'c'] as const; type R = ArrayValues<typeof arr>; const r: R = 'a'",
        shouldPass: true,
      },
      {
        description: "配列にない値は代入できないこと",
        code: "const arr = ['a', 'b', 'c'] as const; type R = ArrayValues<typeof arr>; const r: R = 'd'",
        shouldPass: false,
      },
    ],
  },
  {
    category: "advanced-patterns",
    level: 1,
    difficulty: "easy",
    promptJa: "typeof演算子を使って、変数configから型ConfigTypeを取得してください。",
    starterCode: "const config = { apiUrl: 'https://api.example.com', timeout: 5000 } as const;\n\ntype ConfigType = // ここにtypeofを使って書いてください",
    expectedAnswer: "const config = { apiUrl: 'https://api.example.com', timeout: 5000 } as const;\n\ntype ConfigType = typeof config",
    hints: [
      "typeofを使うと変数から型を取得できます",
    ],
    explanation:
      "typeofは値から型を抽出します。as constと組み合わせると、リテラル型を含む正確な型が得られます。",
    tags: ["typeof", "as const", "basic"],
    testCases: [
      {
        description: "ConfigTypeがconfigの型と一致すること",
        code: "const c: ConfigType = { apiUrl: 'https://api.example.com', timeout: 5000 }",
        shouldPass: true,
      },
      {
        description: "異なる値は代入できないこと",
        code: "const c: ConfigType = { apiUrl: 'https://other.com', timeout: 5000 }",
        shouldPass: false,
      },
    ],
  },
  {
    category: "advanced-patterns",
    level: 1,
    difficulty: "easy",
    promptJa: "isプredicate（型ガード）を使って、値がstringかどうかを判定するisString関数の型を定義してください。",
    starterCode: "function isString(value: unknown): // ここに戻り値の型を書いてください {\n  return typeof value === 'string';\n}",
    expectedAnswer: "function isString(value: unknown): value is string {\n  return typeof value === 'string';\n}",
    hints: [
      "型ガードは value is 型 の形式で書きます",
      "この関数がtrueを返すとき、valueはstring型として扱われます",
    ],
    explanation:
      "型ガード（Type Predicate）は、関数がtrueを返したときに引数の型を絞り込むことをTypeScriptに伝えます。value is stringは「この関数がtrueならvalueはstring」を意味します。",
    tags: ["type guard", "is", "basic"],
    testCases: [
      {
        description: "isString関数でstring型に絞り込めること",
        code: "const x: unknown = 'hello'; if (isString(x)) { const s: string = x }",
        shouldPass: true,
      },
    ],
  },
  {
    category: "advanced-patterns",
    level: 1,
    difficulty: "easy",
    promptJa: "satisfies演算子を使って、colorオブジェクトがRecord<string, string>を満たすことを確認しつつ、リテラル型を保持してください。",
    starterCode: "const colors = // satisfiesを使って書いてください\n  { red: '#ff0000', green: '#00ff00', blue: '#0000ff' };",
    expectedAnswer: "const colors = { red: '#ff0000', green: '#00ff00', blue: '#0000ff' } satisfies Record<string, string>;",
    hints: [
      "satisfiesは型チェックしつつ、推論された型を保持します",
      "as constと違い、値の変更は可能です",
    ],
    explanation:
      "satisfiesはTypeScript 4.9で追加された演算子です。型の制約をチェックしながら、より具体的な型を推論させたい場合に使います。colors.redが'#ff0000'という型で推論されます。",
    tags: ["satisfies", "basic"],
    testCases: [
      {
        description: "colors.redがリテラル型'#ff0000'を持つこと",
        code: "const r: '#ff0000' = colors.red",
        shouldPass: true,
      },
      {
        description: "存在しないキーはエラーになること",
        code: "const r = colors.yellow",
        shouldPass: false,
      },
    ],
  },
  {
    category: "advanced-patterns",
    level: 1,
    difficulty: "medium",
    promptJa: "keyof typeof を使って、STATUS オブジェクトのキーのUnion型StatusKeysを取得してください。",
    starterCode: "const STATUS = { PENDING: 'pending', SUCCESS: 'success', ERROR: 'error' } as const;\n\ntype StatusKeys = // ここに書いてください",
    expectedAnswer: "const STATUS = { PENDING: 'pending', SUCCESS: 'success', ERROR: 'error' } as const;\n\ntype StatusKeys = keyof typeof STATUS",
    hints: [
      "typeof でオブジェクトの型を取得し、keyof でキーのUnion型を取得します",
    ],
    explanation:
      "keyof typeof パターンは、オブジェクトからキーの型を取得するイディオムです。enum的なオブジェクトのキーを型として使う場合に便利です。",
    tags: ["keyof", "typeof", "medium"],
    testCases: [
      {
        description: "StatusKeysがキーのUnion型であること",
        code: "const k: StatusKeys = 'PENDING'",
        shouldPass: true,
      },
      {
        description: "存在しないキーは代入できないこと",
        code: "const k: StatusKeys = 'UNKNOWN'",
        shouldPass: false,
      },
    ],
  },
];

async function main() {
  console.log("Start seeding...");

  for (const problem of problems) {
    const created = await prisma.problem.create({
      data: {
        category: problem.category,
        level: problem.level,
        difficulty: problem.difficulty,
        promptJa: problem.promptJa,
        starterCode: problem.starterCode,
        expectedAnswer: problem.expectedAnswer,
        hints: problem.hints,
        explanation: problem.explanation,
        tags: problem.tags,
        testCases: {
          create: problem.testCases,
        },
      },
    });
    console.log(`Created problem: ${created.id} - ${problem.promptJa.substring(0, 30)}...`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
