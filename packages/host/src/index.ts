import { bootstrap, getAuthController } from "./bootstrap";

bootstrap().then(() => {
  getAuthController().then((auth) => console.log(auth));
});

