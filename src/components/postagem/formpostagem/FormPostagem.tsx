import { useContext, useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import { AuthContext } from "../../../contexts/AuthContext"
import type Postagem from "../../../models/Postagem"
import type Tema from "../../../models/Tema"
import { atualizar, buscar, cadastrar } from "../../../services/Service"
import { ToastAlerta } from "../../../utils/ToastAlerta"

function FormPostagem() {

  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [temas, setTemas] = useState<Tema[]>([])
  const [tema, setTema] = useState<Tema>({ id: 0, descricao: "" })
  const [postagem, setPostagem] = useState<Postagem>({} as Postagem)

  const { usuario, handleLogout } = useContext(AuthContext)
  const token = usuario.token
  const { id } = useParams<{ id: string }>()

  async function buscarPostagemPorId(id: string) {
    try {
      await buscar(`/postagens/${id}`, setPostagem, {
        headers: { Authorization: token }
      })
    } catch (error: any) {
      if (error.toString().includes("401")) {
        handleLogout()
      }
    }
  }

  async function buscarTemaPorId(id: string) {
    try {
      await buscar(`/temas/${id}`, setTema, {
        headers: { Authorization: token }
      })
    } catch (error: any) {
      if (error.toString().includes("401")) {
        handleLogout()
      }
    }
  }

  async function buscarTemas() {
    try {
      await buscar("/temas", setTemas, {
        headers: { Authorization: token }
      })
    } catch (error: any) {
      if (error.toString().includes("401")) {
        handleLogout()
      }
    }
  }

  useEffect(() => {
    if (token === "") {
      ToastAlerta("Você precisa estar logado!", "info")
      navigate("/")
    }
  }, [token])

  useEffect(() => {
    buscarTemas()

    if (id !== undefined) {
      buscarPostagemPorId(id)
    }
  }, [id])

  useEffect(() => {
    setPostagem((postagemAtual) => ({
      ...postagemAtual,
      tema: tema
    }))
  }, [tema])

  function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
    setPostagem({
      ...postagem,
      [e.target.name]: e.target.value,
      tema: tema,
      usuario: usuario
    })
  }

  function retornar() {
    navigate("/postagens")
  }

  async function gerarNovaPostagem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const postagemCompleta = {
      ...postagem,
      tema: tema,
      usuario: usuario
    }

    if (id !== undefined) {
      try {
        await atualizar("/postagens", postagemCompleta, setPostagem, {
          headers: { Authorization: token }
        })

        ToastAlerta("Postagem atualizada com sucesso!", "sucesso")
      } catch (error: any) {
        if (error.toString().includes("401")) {
          handleLogout()
        } else {
          ToastAlerta("Erro ao atualizar a postagem!", "erro")
        }
      }
    } else {
      try {
        await cadastrar("/postagens", postagemCompleta, setPostagem, {
          headers: { Authorization: token }
        })

        ToastAlerta("Postagem cadastrada com sucesso!", "sucesso")
      } catch (error: any) {
        if (error.toString().includes("401")) {
          handleLogout()
        } else {
          ToastAlerta("Erro ao cadastrar a postagem!", "erro")
        }
      }
    }

    setIsLoading(false)
    retornar()
  }

  const carregandoTema = tema.descricao === ""

  return (
    <>
      <div className="container flex flex-col mx-auto items-center">
        <h1 className="text-4xl text-center my-8">
          {id === undefined ? "Cadastrar Postagem" : "Editar Postagem"}
        </h1>

        <form className="flex flex-col w-1/2 gap-4" onSubmit={gerarNovaPostagem}>
          <div className="flex flex-col gap-2">
            <label htmlFor="titulo">Título da Postagem</label>

            <input
              type="text"
              id="titulo"
              name="titulo"
              placeholder="Título"
              required
              className="border-2 border-slate-700 rounded p-2"
              value={postagem.titulo || ""}
              onChange={atualizarEstado}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="texto">Texto da Postagem</label>

            <input
              type="text"
              id="texto"
              name="texto"
              placeholder="Texto"
              required
              className="border-2 border-slate-700 rounded p-2"
              value={postagem.texto || ""}
              onChange={atualizarEstado}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tema">Tema da Postagem</label>

            <select
              id="tema"
              name="tema"
              defaultValue=""
              className="border p-2 border-slate-800 rounded"
              onChange={(e) => buscarTemaPorId(e.currentTarget.value)}
            >
              <option value="" disabled>Selecione um Tema</option>

              {temas.map((tema) => (
                <option key={tema.id} value={tema.id}>
                  {tema.descricao}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={carregandoTema || isLoading}
            className="rounded disabled:bg-slate-200 bg-indigo-400 hover:bg-indigo-800 text-white font-bold w-1/2 mx-auto py-2 flex justify-center"
          >
            {isLoading
              ? <ClipLoader color="#ffffff" size={24} />
              : <span>{id === undefined ? "Cadastrar" : "Atualizar"}</span>
            }
          </button>
        </form>
      </div>
    </>
  )
}

export default FormPostagem