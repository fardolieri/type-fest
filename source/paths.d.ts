import type {StaticPartOfArray, VariablePartOfArray, NonRecursiveType, ToString} from './internal';
import type {IsAny} from './is-any';
import type {UnknownArray} from './unknown-array';
import type {Subtract} from './subtract';
import { IsNever } from './is-never';
import { IfNever } from './if-never';
import { IsEqual } from './is-equal';
import { IsNeverOrAny } from 'expect-type';
import { StringKeyOf } from './string-key-of';

/**
Paths options.

@see {@link Paths}
*/
export type PathsOptions = {
	/**
	The maximum depth to recurse when searching for paths.

	@default 10
	*/
	maxRecursionDepth?: number;
};

/**
Generate a union of all possible paths to properties in the given object.

It also works with arrays.

Use-case: You want a type-safe way to access deeply nested properties in an object.

@example
```
import type {Paths} from 'type-fest';

type Project = {
	filename: string;
	listA: string[];
	listB: [{filename: string}];
	folder: {
		subfolder: {
			filename: string;
		};
	};
};

type ProjectPaths = Paths<Project>;
//=> 'filename' | 'listA' | 'listB' | 'folder' | `listA.${number}` | 'listB.0' | 'listB.0.filename' | 'folder.subfolder' | 'folder.subfolder.filename'

declare function open<Path extends ProjectPaths>(path: Path): void;

open('filename'); // Pass
open('folder.subfolder'); // Pass
open('folder.subfolder.filename'); // Pass
open('foo'); // TypeError

// Also works with arrays
open('listA.1'); // Pass
open('listB.0'); // Pass
open('listB.1'); // TypeError. Because listB only has one element.
```

@category Object
@category Array
*/
// export type Paths<T, Options extends PathsOptions = {}> =
// 	(Options['maxRecursionDepth'] extends number ? Options['maxRecursionDepth'] : 10) extends infer MaxDepth extends number
// 		? T extends T
// 			? Paths_<T, {maxRecursionDepth: MaxDepth}>
// 			: never
// 		: never;

// type Paths_<T, Options extends Required<PathsOptions>> = InternalPaths<PrepareInput<T, Options>, Options>;

// type PrepareInput<T> =
// 	T extends UnknownArray
// 		? number extends T['length']
// 			// We need to handle the fixed and non-fixed index part of the array separately.
// 			? StaticPartOfArray<T> | VariablePartOfArray<T>
// 			: Required<T>
// 		: Required<T>;

// type InternalPaths<T, Options extends Required<PathsOptions>> = {
// 	[Key in keyof T]:
// 		// If `Key` is a number, return `Key | `${Key}``, because both `array[0]` and `array['0']` work.
// 		| Key
// 		| ToString<Key>
// 		| (
// 			Paths_<T[Key], {maxRecursionDepth: Subtract<Options['maxRecursionDepth'], 1>}> extends infer NewPaths extends string | number
// 				? `${Key & (string | number)}.${NewPaths}`
// 				: never
// 		)
// }[T extends UnknownArray
// 	// Limit `Key` to string or number. Exclude symbols.
// 	? keyof T & number
// 	: keyof T & (number | string)
// ];





export type TailPath<T, Options extends Required<PathsOptions> = {maxRecursionDepth: 50}, Prefix extends string | number = never, Acc extends string | number = never> =
	T extends T
		? ShouldBreakRecursion<T, Options> extends true
			? Acc
			: TailPath_<T, Options, Prefix, Acc>
		: never;

type TailPath_<
	T_,
	Options extends Required<PathsOptions>,
	Prefix extends string | number,
	Acc extends string | number,
	T = PrepareInput<T_>,
	Key extends keyof T & (string | number) = { [Key in keyof T]: Key}[T extends UnknownArray ? keyof T & number : keyof T & (number | string)],
	TupleIndex extends string = never,
	
> =
	IsNever<Key> extends true
		? Acc
		: Key extends Key
			? IfNever<Prefix, Key | `${Key}`, `${Prefix}.${Key}`> extends infer NewPrefix extends string | number
				? TailPath<
					T[Key],
					{maxRecursionDepth: Subtract<Options['maxRecursionDepth'], 1>},
					NewPrefix,
					Acc | NewPrefix
				>
				: never
			: never;


type x30 = { [Key in keyof {}]: Key}[{} extends UnknownArray ? keyof {} & number : keyof {} & (number | string)]
type x10 = TailPath<Record<1, unknown>>
type x20 =TailPath<
	unknown,
	{maxRecursionDepth: 10},
	1 | '1',
	1 | '1'
>
type RecFoo = {foo: RecFoo}
type x1 = TailPath<RecFoo, {maxRecursionDepth: 200}>
type ABC = {a: {b: {c: string}}}
type x2 = TailPath<DeepObject, {maxRecursionDepth: 100}>;
type DeepObject = {
	a: {
		b: {
			c: {
				d: string;
			};
		};
		b2: DeepObject;
		b3: boolean;
	};
};

type x3 = TailPath<DeepObject[keyof DeepObject], {maxRecursionDepth: 20}, `${StringKeyOf<DeepObject>}`>
type x4 = TailPath<DeepObject['a'][keyof DeepObject['a']], {maxRecursionDepth: 20}, `${StringKeyOf<DeepObject['a']>}`>


type ShouldBreakRecursion<T, Options extends Required<PathsOptions>> =
	IsNeverOrAny<T> extends true
		? true
		: 0 extends Options['maxRecursionDepth']
			? true
			: T extends NonRecursiveType | ReadonlyMap<unknown, unknown> | ReadonlySet<unknown>
				? true
				: false;

type PrepareInput<T> =
	T extends UnknownArray
		? number extends T['length']
			// We need to handle the fixed and non-fixed index part of the array separately.
			? StaticPartOfArray<T> | VariablePartOfArray<T>
			: Required<T>
		: Required<T>;


type ToArray<T>= T extends T ? T[] : never
type arr = ToArray<1 | 2 | (number & {})>
type arrX = 1[] | 2[] | number[]

type DistributeToString<T extends string | number> = 1
type Test = DistributeToString<1 | 2 | number>
