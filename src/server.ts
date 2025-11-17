import { app } from "./app";
import { animalRouter } from "./routes/animalRoutes";
import { ongRouter } from "./routes/ongRoutes";
import { userRouter } from "./routes/usuarioRoutes";
import { adocaoRouter } from "./routes/adocaoRoutes";
import { prioridadeRouter } from "./routes/prioridadesRoutes";
import { doacaoRouter } from "./routes/doacaoRoutes";
import { ocorrenciaRouter } from "./routes/ocorrenciaRoutes";
import { authRouter } from "./routes/authRoutes";


app.use('/usuarios', userRouter);
app.use('/animais', animalRouter);
app.use('/ongs', ongRouter);
app.use('/adocoes', adocaoRouter);
app.use('/prioridades', prioridadeRouter);
app.use('/ocorrencias', ocorrenciaRouter);
app.use('/auth', authRouter); 
app.use('/doacoes', doacaoRouter);