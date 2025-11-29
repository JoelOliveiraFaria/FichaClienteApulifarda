import {useState, useEffect} from 'react';

export default function ClienteForm({onSaved, cliente}){
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [contatoEmpresarial, setContatoEmpresarial] = useState('');
    const [contatoPessoal, setContatoPessoal] = useState('');
    const [morada, setMorada] = useState('');
    const [nif, setNif] = useState('');

    useEffect(()=> {
        if(cliente){
            setNome(cliente.nome);
            setEmail(cliente.email);
            setContatoEmpresarial(cliente.contatoEmpresarial);
            setContatoPessoal(cliente.contatoPessoal);
            setMorada(cliente.morada);
            setNif(cliente.nif);
        }
    }, [cliente]);


    const handleSubmit = (e) => {
        e.preventDefault();
        onSaved({
            id: cliente ? cliente.id : undefined,
            nome,
            email,
            contatoEmpresarial,
            contatoPessoal,
            morada,
            nif
        });

        setNome('');
        setEmail('');
        setContatoEmpresarial('');
        setContatoPessoal('');
        setMorada('');
        setNif('');
    }



    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
            <input placeholder="Telefone Pessoal" value={contatoPessoal} onChange={e => setContatoPessoal(e.target.value)} />
            <input placeholder="Telefone Empresarial" value={contatoEmpresarial} onChange={e => setContatoEmpresarial(e.target.value)}/>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
            <input placeholder="Morada" value={morada} onChange={e => setMorada(e.target.value)}/>
            <input placeholder="NIF" value={nif} onChange={e => setNif(e.target.value)}/>
            <button type="submit">Salvar Cliente</button>
        </form>
    );

};
