import type {StaticPartOfArray, VariablePartOfArray, NonRecursiveType, ToString} from './internal';
import type {IsAny} from './is-any';
import type {UnknownArray} from './unknown-array';
import type {Subtract} from './subtract';

/**
Paths options.

@see {@link Paths}
*/
export type PathsOptions = {
	/**
	The maximum depth to recurse when searching for paths.

	@default 10
	*/
	maxDepth?: number;
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
export type Paths<T, Options extends PathsOptions = {}> =
	(Options['maxDepth'] extends number ? Options['maxDepth'] : 10) extends infer MaxDepth extends number
		? Paths_<T, {maxDepth: MaxDepth}>
		: never;

type Paths_<T, Options extends Required<PathsOptions>> =
	0 extends Options['maxDepth'] // Limit depth to prevent infinite recursion
		? never
		: T extends NonRecursiveType | ReadonlyMap<unknown, unknown> | ReadonlySet<unknown>
			? never
			: IsAny<T> extends true
				? never
				: (T extends UnknownArray
					? number extends T['length']
						// We need to handle the fixed and non-fixed index part of the array separately.
						? StaticPartOfArray<T> | VariablePartOfArray<T>
						: T
					: T
				) extends infer NewT
					? InternalPaths<Required<NewT>, Options>
					: never;

type InternalPaths<T, Options extends Required<PathsOptions>> = {
	[Key in keyof T]:
		// If `Key` is a number, return `Key | `${Key}``, because both `array[0]` and `array['0']` work.
		| Key
		| ToString<Key>
		| (
			Paths_<T[Key], {maxDepth: Subtract<Options['maxDepth'], 1>}> extends infer NewPaths extends string | number
				? `${Key & (string | number)}.${NewPaths}`
				: never
		)
}[T extends UnknownArray
	// Limit `Key` to string or number. Exclude symbols.
	? keyof T & number
	: keyof T & (number | string)
];
