import { toast } from "react-toastify"

type TipoAlerta = "sucesso" | "erro" | "info"

export function ToastAlerta(mensagem: string, tipo: TipoAlerta) {

  const configuracao = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored" as const
  }

  switch (tipo) {
    case "sucesso":
      toast.success(mensagem, configuracao)
      break

    case "erro":
      toast.error(mensagem, configuracao)
      break

    default:
      toast.info(mensagem, configuracao)
  }
}