import { TypedError } from 'typed-error';

export enum ErrorLevel {
	ERROR = 'error',
	FATAL = 'fatal',
	WARN = 'warn',
	INFO = 'info',
	DEBUG = 'debug',
}

export class ComposeError extends TypedError {
	constructor(
		public message: string,
		// The error level, e.g. "error", "fatal", "panic"
		public level = ErrorLevel.ERROR,
		public name = 'ComposeError',
	) {
		super(message);
	}
}

export class ValidationError extends ComposeError {
	constructor(public message: string) {
		super(message, ErrorLevel.ERROR, 'ValidationError');
	}
}

export class ServiceError extends ComposeError {
	constructor(
		public message: string,
		public serviceName: string,
	) {
		super(message, ErrorLevel.ERROR, 'ServiceError');
	}
}

export class ArgumentError extends ComposeError {
	constructor(public message: string) {
		super(message, ErrorLevel.ERROR, 'ArgumentError');
	}
}
