import { Metadata } from "next"

type Props = {
    params: Promise<{jamId: string}>;
}

export const generateMetadata = async ({
    params,
}: Props): Promise<Metadata> => {
    const id = (await params).jamId;
    return{
        title: `${id}`
    }
}

export default async function Jam({params}: Props){
    const jamId = (await params).jamId
    return <h1>Jam {jamId}</h1>
}