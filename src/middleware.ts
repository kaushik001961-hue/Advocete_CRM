export { auth as middleware } from "@/auth";

export const config = {

matcher: [

"/dashboard/:path*",

"/clients/:path*",

"/cases/:path*",

"/hearings/:path*",

"/billing/:path*",

"/documents/:path*",

],

};