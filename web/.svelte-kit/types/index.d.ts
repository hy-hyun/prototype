type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined;
	"/dashboard": undefined;
	"/enroll": undefined;
	"/notices": undefined;
	"/search": undefined;
	"/timetable": undefined
};

export type RouteId = "/" | "/dashboard" | "/enroll" | "/notices" | "/search" | "/timetable";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/dashboard" | "/enroll" | "/notices" | "/search" | "/timetable";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/robots.txt";